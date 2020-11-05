import { Op } from 'sequelize';
import httpStatus from 'http-status'; // eslint-disable-line no-unused-vars
import { sequelize } from 'src/orm/database';
import { Message, Tag, Trait, Love, View } from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import { getNextMessageQuery } from 'src/server/topics/message/message.query';
import { PRIVACY_LEVEL } from 'src/server/constants';

export class MessageService {
  static async getAll(requesterId, requestedId, { transaction = null } = {}) {
    const requiredPrivacy = (requesterId === requestedId) ? [PRIVACY_LEVEL.PRIVATE, PRIVACY_LEVEL.PUBLIC] : [PRIVACY_LEVEL.PUBLIC];
    return Message.unscoped().findAll({
      attributes: [
        'id',
        'publishedAt',
        'emotionCode',
        'privacy',
        'content',
        'userId',
        [sequelize.cast(sequelize.fn('COUNT', sequelize.col('"Loves"."id"')), 'int'), 'nbLoves'],
        [sequelize.cast(sequelize.fn('COUNT', sequelize.col('"Views"."id"')), 'int'), 'nbViews'],
      ],
      include: [
        { model: Love.unscoped(), attributes: [] },
        { model: View.unscoped(), attributes: [] },
      ],
      group: ['Message.id'],
      order: [['publishedAt', 'desc']],
      where: { userId: requestedId, privacy: { [Op.in]: requiredPrivacy } },
      raw: true,
      nest: true,
      transaction,
    });
  }

  static async get(messageId, { transaction = null, reqUserId = null } = {}) {
    const message = await Message.unscoped().findByPk(messageId, {
      attributes: [
        'id',
        'publishedAt',
        'emotionCode',
        'privacy',
        'content',
        'userId',
        [sequelize.cast(sequelize.fn('COUNT', sequelize.col('"Loves"."id"')), 'int'), 'nbLoves'],
        [sequelize.cast(sequelize.fn('COUNT', sequelize.col('"Views"."id"')), 'int'), 'nbViews'],
      ],
      include: [
        { model: Love.unscoped(), attributes: [] },
        { model: View.unscoped(), attributes: [] },
      ],
      group: ['Message.id'],
      transaction,
      raw: true,
      nest: true,
    });
    console.log('reqUserId : ', reqUserId)
    if (message.privacy === PRIVACY_LEVEL.PRIVATE && reqUserId) await MessageService.checkUserRight(reqUserId, messageId, { transaction });
    const traitNames = (await Tag.unscoped().findAll({
      attributes: [],
      where: { messageId },
      include: [
        { model: Trait.unscoped(), attributes: ['name'], required: true },
      ],
      transaction,
    })).map((tag) => tag.Trait.name);
    if (reqUserId && reqUserId !== message.userId) {
      await MessageService.createView(messageId, reqUserId, { transaction });
      message.nbViews += 1;
    }
    return { ...message, traitNames };
  }

  static async getNext(reqUserId, { transaction = null } = {}) {
    // for now, very simple getNext function based on view and most recent messages others than mine.
    // later, when we will have more data, it will be based on user similarity
    // Useful variables/features : messages written by reqUser, tags used by reqUser,
    // views duration, messages loved, users subscribed, saved messages
    const [{ id }] = await sequelize.query(getNextMessageQuery(), {
      type: sequelize.QueryTypes.SELECT,
      raw: true,
      replacements: { reqUserId },
      transaction,
    });
    return MessageService.get(id, { reqUserId, transaction });
  }

  static async createView(messageId, viewerId, { transaction = null } = {}) {
    return View.create(
      { messageId, userId: viewerId, viewedAt: moment().toISOString() },
      { transaction },
    );
  }

  static async createOrUpdateTagsAndTraits(messageId, traitNames, { transaction = null } = {}) {
    if (traitNames === undefined) return null;
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
    const traitsAlreadyCreated = await Trait.unscoped().findAll({
      attributes: ['id', 'name'],
      include: [{
        model: Tag.unscoped(),
        attributes: ['id'],
        required: false,
        where: { messageId },
      }],
      where: { name: traitNames },
      transaction,
      raw: true,
      nest: true,
    });
    const traitsAlreadyCreatedButNotLinked = traitsAlreadyCreated.filter((trait) => trait.tags.length === 0).map((trait) => trait.id);
    const traitsAlreadyCreatedNames = traitsAlreadyCreated.map((t) => t.name);
    const traitsNotExisting = traitNames.filter((trait) => !traitsAlreadyCreatedNames.includes(trait.name));
    const newTraits = await Trait.bulkCreate(traitsNotExisting.map((name) => ({ name })), { returning: true, transaction });
    const tagsToCreate = [
      ...newTraits.map((t) => t.id),
      ...traitsAlreadyCreatedButNotLinked,
    ].map((traitId) => ({ traitId, messageId }));
    return Tag.bulkCreate(tagsToCreate, { transaction });
  }

  static async create(messageData, { transaction = null } = {}) {
    const publishedAt = moment().toISOString();
    const message = await Message.create({ ...messageData, publishedAt }, { transaction });
    await MessageService.createOrUpdateTagsAndTraits(message.id, messageData.traitNames, { transaction });
    return MessageService.get(message.id, { transaction });
  }

  static async update(messageId, messageData, { transaction = null } = {}) {
    await Message.update(messageData, { where: { id: messageId }, transaction });
    await MessageService.createOrUpdateTagsAndTraits(messageId, messageData.traitNames, { transaction });
    return MessageService.get(messageId, { transaction });
  }

  static async checkUserRight(userId, messageId, { transaction = null } = {}) {
    const hasRight = await Message.unscoped().count({ where: { id: messageId, userId }, transaction });
    if (!hasRight) {
      throw new BackError(`User has no right on message ${messageId}`, httpStatus.FORBIDDEN);
    }
  }

  static async loveOrUnlove(messageId, reqUserId, { transaction = null } = {}) {
    const message = await Message.unscoped().findByPk(messageId, { attributes: ['privacy'], transaction });
    if (message.privacy === PRIVACY_LEVEL.PRIVATE) throw new BackError('Cannot love a private message', httpStatus.BAD_REQUEST);
    const isAlreadyLove = await Love.findOne({ where: { messageId, userId: reqUserId }, transaction });
    if (isAlreadyLove) {
      await isAlreadyLove.destroy({ transaction });
    } else {
      await Love.create({ messageId, userId: reqUserId, lovedAt: moment().toISOString() }, { transaction });
    }
    return MessageService.get(messageId, { transaction });
  }

  static async delete(messageId, reqUserId, { transaction = null } = {}) {
    await MessageService.checkUserRight(reqUserId, messageId, { transaction });
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
