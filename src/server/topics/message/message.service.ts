import httpStatus from 'http-status'; // eslint-disable-line no-unused-vars
import {
  Op, QueryTypes, sequelize, Sequelize,
} from 'src/orm/database';
import {
  Comment, Favorite, Love, Message, Tag, Trait, View, Trophee,
} from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import { getNextMessageQuery } from 'src/server/topics/message/message.query';
import { ContextType, PrivacyLevel } from 'src/server/constants';
import { FindAttributeOptions } from 'sequelize';
import UserService from 'src/server/topics/user/user.service';

export class MessageService {
  static async isPublicMessage(messageId, { transaction = null } = {}) {
    return Message.count({ where: { id: messageId, privacy: PrivacyLevel.PUBLIC }, transaction })
      .then((messagesCount) => messagesCount !== 0);
  }

  static getAttributes({ withCustomAttributes = false, reqUserId = null }) {
    const baseAttributes = [
      'id',
      'publishedAt',
      'emotionCode',
      'privacy',
      'content',
      'userId',
      [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('"loves"."id"'))), 'int'), 'nbLoves'],
      [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('"views"."id"'))), 'int'), 'nbViews'],
      [Sequelize.cast(Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('"comments"."id"'))), 'int'), 'nbComments'],
    ];
    const customAttributes = [
      [Sequelize.fn('coalesce',
        (Sequelize.fn('bool_or', Sequelize.literal(`"loves"."user_id" = ${reqUserId}`))), 'false'), 'loved'],
      [Sequelize.fn('coalesce',
        (Sequelize.fn('bool_or', Sequelize.literal(`"favorites"."user_id" = ${reqUserId}`))), 'false'), 'isFavorite'],
      [Sequelize.fn('coalesce',
        (Sequelize.fn('bool_or', Sequelize.literal(`"comments"."user_id" = ${reqUserId}`))), 'false'), 'commented'],
    ];
    return withCustomAttributes ? [...baseAttributes, ...customAttributes] : baseAttributes;
  }

  static async getTropheeInfo(messageId, reqUserId, { transaction = null } = {}) {
    const tropheesStatsRaw = await Trophee.findAll({
      group: ['tropheeCode'],
      attributes: ['tropheeCode', [Sequelize.cast(Sequelize.fn('COUNT', 'tropheeCode'), 'int'), 'tropheesStats']],
      where: { messageId },
      transaction,
      raw: true,
    });
    const tropheesStats = tropheesStatsRaw.reduce(
      (obj, item: any) => Object.assign(obj, { [item.tropheeCode]: item.tropheesStats }), {},
    );
    const userTrophee = await Trophee.findOne({ where: { messageId, userId: reqUserId }, transaction });
    const connectedUserTrophee = userTrophee
      ? userTrophee.tropheeCode
      : null;
    return { connectedUserTrophee, tropheesStats };
  }

  static async enrichMessage(message, {
    requesterId = null,
    userData = null,
    transaction = null,
    updateViewCount = false,
  } = {}) {
    if (updateViewCount) await View.create({ userId: requesterId, messageId: message.id }, { transaction });
    const user = userData || (await UserService.getUser(message.userId, { reqUserId: requesterId, transaction }));
    const traitNames = await MessageService.getMessageTraits(message.id, { transaction });
    const tropheeInfo = await MessageService.getTropheeInfo(message.id, requesterId, { transaction });
    return {
      ...message, user, traitNames, ...tropheeInfo,
    };
  }

  static async getAll(requesterId, requestedId, {
    transaction = null, favorite = false, limit = 10, offset = 0,
  } = {}) {
    const requiredPrivacy = (requesterId === requestedId) ? [PrivacyLevel.PRIVATE, PrivacyLevel.PUBLIC] : [PrivacyLevel.PUBLIC];
    const attributes = MessageService.getAttributes({ withCustomAttributes: true, reqUserId: requesterId }) as string[];
    const { count: total, rows: rawMessages } = await Message.unscoped().findAndCountAll({
      attributes,
      include: [
        { model: Love.unscoped(), attributes: [] },
        { model: View.unscoped(), attributes: [] },
        { model: Favorite.unscoped(), attributes: [], ...favorite ? { required: true, where: { userId: requesterId } } : {} },
        { model: Comment.unscoped(), attributes: [] },
      ],
      group: favorite ? ['message.id', 'favorites.added_at'] : ['message.id'],
      order: favorite ? [[Sequelize.literal('favorites.added_at'), 'desc']] : [['publishedAt', 'desc']],
      where: { privacy: { [Op.in]: requiredPrivacy }, ...favorite ? {} : { userId: requestedId } },
      raw: true,
      nest: true,
      subQuery: false,
      transaction,
      limit,
      offset,
    });
    const userData = await UserService.getUser(requestedId, { reqUserId: requesterId, transaction });
    return {
      total,
      messages: await Promise.all(rawMessages.map(
        (m) => MessageService.enrichMessage(m, {
          requesterId, userData, transaction, updateViewCount: requestedId !== requesterId,
        }),
      )),
    };
  }

  static async getMessageTraits(messageId, { transaction = null } = {}) {
    return (await Tag.unscoped().findAll({
      attributes: [],
      where: { messageId },
      include: [
        { model: Trait.unscoped(), attributes: ['name'], required: true },
      ],
      transaction,
    })).map((tag: any) => tag.trait.name);
  }

  static async get(messageId, { transaction = null, reqUserId = null, updateViewCount = false } = {}) {
    const { userId, privacy } = await Message.unscoped().findByPk(messageId, { transaction, attributes: ['userId', 'privacy'] });
    if (privacy === PrivacyLevel.PRIVATE && reqUserId) await MessageService.checkUserRight(reqUserId, messageId, { transaction });
    const messageAttributes = MessageService.getAttributes({ withCustomAttributes: !!reqUserId, reqUserId });
    if (updateViewCount && reqUserId && reqUserId !== userId) {
      await MessageService.createView(messageId, reqUserId, { transaction });
    }
    const message: any = await Message.unscoped().findByPk(messageId, {
      attributes: messageAttributes as FindAttributeOptions,
      include: [
        { model: Love.unscoped(), attributes: [] },
        { model: View.unscoped(), attributes: [] },
        { model: Favorite.unscoped(), attributes: [] },
        { model: Comment.unscoped(), attributes: [] },
      ],
      group: ['message.id'],
      transaction,
      raw: true,
      nest: true,
    });
    return MessageService.enrichMessage(message, { transaction, requesterId: reqUserId });
  }

  static async getNext(reqUserId, { transaction = null, context = ContextType.ALL } = {}) {
    // for now, very simple getNext function based on view and most recent messages others than mine.
    // later, when we will have more data, it will be based on user similarity
    // Useful variables/features : messages written by reqUser, tags used by reqUser,
    // views duration, messages loved, users subscribed, saved messages
    const [{ id }]: any = await sequelize.query(getNextMessageQuery(context), {
      type: QueryTypes.SELECT,
      raw: true,
      replacements: { reqUserId },
      transaction,
    });
    return MessageService.get(id, { reqUserId, updateViewCount: true, transaction });
  }

  static async createView(messageId, viewerId, { transaction = null } = {}) {
    return View.create(
      { messageId, userId: viewerId, viewedAt: moment().toISOString() },
      { transaction },
    );
  }

  static async createTraitsIfRequired(traitNames, { transaction = null } = {}) {
    const traitsAlreadyCreated = await Trait.unscoped().findAll({
      attributes: ['id', 'name'],
      where: { name: traitNames },
      transaction,
      raw: true,
      nest: true,
    });
    const traitsAlreadyCreatedNames = traitsAlreadyCreated.map((t) => t.name);
    const traitsNotExisting = traitNames.filter((trait) => !(traitsAlreadyCreatedNames.includes(trait)));
    return Trait.bulkCreate(traitsNotExisting.map((name) => ({ name })), { returning: true, transaction });
  }

  static async unTag(messageId, traitNames, { transaction = null } = {}) {
    const currentTagsToDeleteIds = (await Tag.unscoped().findAll({
      where: { messageId },
      attributes: ['id'],
      include: [{
        model: Trait.unscoped(),
        attributes: ['id', 'name'],
        required: true,
        where: { name: { [Op.notIn]: traitNames } },
      }],
      transaction,
      raw: true,
      nest: true,
    })).map((t) => t.id);
    if (currentTagsToDeleteIds.length) await Tag.destroy({ where: { id: currentTagsToDeleteIds }, transaction });
  }

  static async setNewTags(messageId, traitNames, { transaction = null } = {}) {
    const traitsNotLinked = (await Trait.unscoped().findAll({
      attributes: ['id', 'name'],
      include: [{
        model: Tag.unscoped(),
        attributes: ['id'],
        required: false,
        where: { messageId },
      }],
      where: {
        [Op.and]: [
          { name: traitNames },
          { '$"tags"."id"$': null },
        ],
      },
      transaction,
      raw: true,
    })).map((trait) => trait.id);
    const tagsToCreate = traitsNotLinked.map((traitId) => ({ traitId, messageId }));
    return Tag.bulkCreate(tagsToCreate, { transaction });
  }

  static async createOrUpdateTagsAndTraits(messageId, traitNames, { transaction = null } = {}) {
    if (traitNames === undefined) return null;
    await sequelize.query('LOCK TABLE trait IN ACCESS EXCLUSIVE MODE;', { transaction });
    await MessageService.createTraitsIfRequired(traitNames, { transaction });
    await MessageService.unTag(messageId, traitNames, { transaction });
    return MessageService.setNewTags(messageId, traitNames, { transaction });
  }

  static async create(messageData, { transaction = null } = {}) {
    const publishedAt = moment().toISOString();
    const message = await Message.create({ ...messageData, publishedAt }, { transaction });
    await MessageService.createOrUpdateTagsAndTraits(message.id, messageData.traitNames, { transaction });
    await UserService.updateUserScore(messageData.userId, { messageId: message.id, transaction });
    await UserService.updateDynamic(messageData.userId, { transaction });
    return MessageService.get(message.id, { transaction });
  }

  static async update(messageId, messageData, { transaction = null, userId = null } = {}) {
    await Message.update(messageData, { where: { id: messageId }, transaction });
    await MessageService.createOrUpdateTagsAndTraits(messageId, messageData.traitNames, { transaction });
    await UserService.updateUserScore(userId, { messageId, transaction });
    await UserService.updateDynamic(userId, { transaction });
    return MessageService.get(messageId, { transaction });
  }

  static async checkUserRight(userId, messageId, { transaction = null } = {}) {
    const hasRight = await Message.unscoped().count({ where: { id: messageId, userId }, transaction });
    if (!hasRight) {
      throw new BackError(`User has no right on message ${messageId}`, httpStatus.FORBIDDEN);
    }
  }

  static async addOrRemoveRessource(messageId, reqUserId, { transaction = null, Model = null } = {}) {
    const isPublicMessage = await MessageService.isPublicMessage(messageId, { transaction });
    if (!isPublicMessage && Model === Love) throw new BackError('Cannot love a private message', httpStatus.BAD_REQUEST);
    const isAlreadyExistingInstance = await Model.findOne({ where: { messageId, userId: reqUserId }, transaction });
    if (isAlreadyExistingInstance) {
      await isAlreadyExistingInstance.destroy({ transaction });
    } else {
      await Model.create({ messageId, userId: reqUserId }, { transaction });
    }
    return MessageService.get(messageId, { transaction, reqUserId });
  }

  static async loveOrUnlove(messageId, reqUserId, { transaction = null } = {}) {
    return MessageService.addOrRemoveRessource(messageId, reqUserId, { transaction, Model: Love });
  }

  static async addOrRemoveFavorite(messageId, reqUserId, { transaction = null } = {}) {
    return MessageService.addOrRemoveRessource(messageId, reqUserId, { transaction, Model: Favorite });
  }

  static async delete(messageId, reqUserId, { transaction = null } = {}) {
    await MessageService.checkUserRight(reqUserId, messageId, { transaction });
    await UserService.updateUserScore(reqUserId, { messageId, transaction, deleteCase: true });
    await UserService.updateDynamic(reqUserId, { transaction });
    await Tag.destroy({ where: { messageId }, transaction });
    await View.destroy({ where: { messageId }, transaction });
    await Love.destroy({ where: { messageId }, transaction });
    await Message.destroy({ where: { id: messageId }, transaction });
  }

  static async searchTraits(q, { transaction = null } = {}) {
    return (await Trait.unscoped().findAll({
      transaction,
      where: { name: { [Op.iLike]: `%${q}%` } },
    })).map((t) => t.name);
  }
}
