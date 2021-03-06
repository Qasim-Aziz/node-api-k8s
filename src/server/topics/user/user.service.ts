import { Op } from 'sequelize';
import {
  Message, User, Tag, Comment, Follower, Trophee,
} from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import httpStatus from 'http-status';
import { DynamicLevel, EmotionNote, PrivacyLevel } from 'src/server/constants';
import { Sequelize } from 'src/orm/database';
import { TraitService } from 'src/server/topics/trait/trait.service';

export default class UserService {
  static async checkEmailExist(email, { transaction = null } = {}) {
    return User.count({ where: { email }, transaction })
      .then((count) => count !== 0);
  }

  static async checkPseudoExist(pseudo, { transaction = null, userId = null } = {}) {
    return User.count({ where: { pseudo, ...userId ? { id: { [Op.not]: userId } } : {} }, transaction })
      .then((count) => count !== 0);
  }

  static async getUserTropheeInfo(userId, { transaction = null } = {}) {
    const tropheesStatsRaw = await Trophee.findAll({
      group: ['tropheeCode'],
      attributes: ['tropheeCode', [Sequelize.cast(Sequelize.fn('COUNT', 'tropheeCode'), 'int'), 'tropheesStats']],
      include: [
        {
          model: Message.unscoped(),
          attributes: [],
          required: true,
          where: { userId },
        },
      ],
      transaction,
      raw: true,
    });
    const tropheesStats = tropheesStatsRaw.reduce(
      (obj, item: any) => Object.assign(obj, { [item.tropheeCode]: item.tropheesStats }), {},
    );
    const nbTropheesGiven = await Trophee.count({
      where: { userId },
      transaction,
    });
    return { nbTrophees: Object.values(tropheesStats).reduce((a: any, b: any) => a + b, 0), tropheesStats, nbTropheesGiven };
  }

  static async getUser(userId, { reqUserId = null, transaction = null } = {}) {
    const userRaw = await User.unscoped().findByPk(userId, {
      attributes: [
        'id',
        'pseudo',
        'nbConsecutiveConnexionDays',
        'description',
        'shouldResetPassword',
        'totalScore',
        'remainingScore',
        'dynamic',
        'type',
        'gender',
      ],
      transaction,
      raw: true,
      nest: true,
    });
    const nbMessages = await Message.count({ where: { userId }, transaction });
    const nbFollowers = await Follower.count({ where: { followedId: userId }, transaction });
    const nbFollowed = await Follower.count({ where: { followerId: userId }, transaction });
    const following = !!(await Follower.findOne({ where: { followerId: reqUserId, followedId: userId }, transaction }));
    const userTropheeInfo = await UserService.getUserTropheeInfo(userId, { transaction });
    const traitNames = await TraitService.getTraits({ userId, transaction });
    return {
      ...userRaw, ...userTropheeInfo, nbMessages, nbFollowers, nbFollowed, following, traitNames,
    };
  }

  static computeTraitsScores(traitsLength) {
    if (traitsLength > 5) {
      return 2;
    }
    if (traitsLength !== 0) {
      return 1;
    }
    return 0;
  }

  static computeMessageScore(message) {
    const contentLength = message.content.length;
    const traitsLength = message.tags.length;
    const privacyMultiple = (message.privacy === PrivacyLevel.PUBLIC) ? 2 : 1;
    const traitScores = UserService.computeTraitsScores(traitsLength);
    if (contentLength > 1000) {
      return privacyMultiple * 5 + traitScores;
    }
    if (contentLength > 500) {
      return privacyMultiple * 3 + traitScores;
    }
    return privacyMultiple * 1 + traitScores;
  }

  static computeCommentScore(comment) {
    const commentLength = comment.content.length;
    if (commentLength > 150) {
      return 2;
    }
    return 1;
  }

  static async updateMessageScore(messageId, { deleteCase = false, transaction = null } = {}) {
    const message = await Message.unscoped().findByPk(messageId, {
      attributes: ['addedScore', 'content', 'privacy', 'userId'],
      include: [
        { model: Tag.unscoped(), attributes: ['id'], required: false },
      ],
      transaction,
    });
    const messageScore = UserService.computeMessageScore(message);
    if (deleteCase) {
      return 0 - messageScore;
    }
    await Message.update({ addedScore: messageScore }, { where: { id: messageId }, transaction });
    return messageScore - message.addedScore;
  }

  static async updateCommentScore(commentId, { deleteCase = false, transaction = null } = {}) {
    const comment = await Comment.unscoped().findByPk(commentId, {
      attributes: ['addedScore', 'content'],
      transaction,
    });
    const commentScore = UserService.computeCommentScore(comment);
    if (deleteCase) {
      return 0 - commentScore;
    }
    await Comment.update({ addedScore: commentScore }, { where: { id: commentId }, transaction });
    return commentScore - comment.addedScore;
  }

  static async updateUserScore(userId, {
    messageId = null,
    commentId = null,
    deleteCase = false,
    transaction = null,
  } = {}) {
    const delta = messageId
      ? await UserService.updateMessageScore(messageId, { deleteCase, transaction })
      : await UserService.updateCommentScore(commentId, { deleteCase, transaction });
    const user = await User.unscoped().findByPk(userId, { attributes: ['id', 'totalScore', 'remainingScore'], transaction });
    await User.update(
      {
        totalScore: Math.max(user.totalScore + delta, 0),
        remainingScore: Math.max(user.remainingScore + delta, 0),
      },
      { where: { id: user.id }, transaction },
    );
  }

  static async updateUser(userId, userData, { transaction = null } = {}) {
    const user = await User.findByPk(userId, { transaction });
    if (userData.password && user.shouldResetPassword) {
      Object.assign(userData, { shouldResetPassword: false });
    }
    if (userData.pseudo) {
      const isPseudoUsed = await UserService.checkPseudoExist(userData.pseudo, { transaction, userId });
      if (isPseudoUsed) throw new BackError('Le pseudo est d??j?? utilis??', httpStatus.BAD_REQUEST);
    }
    await user.update(userData, { transaction });
    await TraitService.createOrUpdateTagsAndTraits(userData.traitNames, { transaction, userId });
    return UserService.getUser(userId, { reqUserId: userId, transaction });
  }

  static async updateConnexionInformation(userId, nbConsecutiveConnexionDays, { transaction = null } = {}) {
    await User.update({ nbConsecutiveConnexionDays, lastConnexionDate: moment().toISOString() },
      { where: { id: userId }, transaction });
    return UserService.getUser(userId, { reqUserId: userId, transaction });
  }

  static computeNbConsecutiveDays(lastConnexionDate, previousNbConsecutiveConnexionDays) {
    if (!lastConnexionDate) return 0;
    const dayDiff = moment(moment().format('MM/DD/YYYY'))
      .diff(moment(moment(lastConnexionDate).format('MM/DD/YYYY')), 'days');
    const hasConnectedTwoConsecutiveDays = dayDiff === 1;
    const isSameDay = dayDiff === 0;
    const newNbConsecutiveConnexionDays = hasConnectedTwoConsecutiveDays ? previousNbConsecutiveConnexionDays + 1 : 0;
    return isSameDay ? previousNbConsecutiveConnexionDays : newNbConsecutiveConnexionDays;
  }

  static async refreshUserLastConnexionDate(userId, { transaction = null } = {}) {
    const user = await User.unscoped().findByPk(userId, {
      attributes: ['lastConnexionDate', 'nbConsecutiveConnexionDays'],
      transaction,
    });
    if (moment(user.lastConnexionDate).isSameOrAfter(moment().startOf('day'))) return user;
    const newNbConsecutiveDays = UserService.computeNbConsecutiveDays(user.lastConnexionDate, user.nbConsecutiveConnexionDays);
    return UserService.updateConnexionInformation(userId, newNbConsecutiveDays, { transaction });
  }

  static async followOrUnfollow(followerId, followedId, { transaction = null } = {}) {
    const following = await Follower.findOne({ where: { followerId, followedId }, transaction });
    if (following) {
      await following.destroy({ transaction });
    } else {
      await Follower.create({ followerId, followedId }, { transaction });
    }
    return UserService.getUser(followedId, { reqUserId: followerId, transaction });
  }

  static async getFollowers(followedId, { transaction = null, limit = 10, offset = 0 } = {}) {
    const { rows: followers, count: total } = await User.unscoped().findAndCountAll({
      attributes: ['pseudo'],
      include: [
        {
          model: Follower.unscoped(),
          attributes: [],
          as: 'followed',
          where: { followedId },
        },
      ],
      transaction,
      raw: true,
      nest: true,
      limit,
      offset,
      subQuery: false,
    });
    return { followers, total };
  }

  static async getFollowed(followerId, { transaction = null, limit = 10, offset = 0 } = {}) {
    const { rows: followed, count: total } = await User.unscoped().findAndCountAll({
      attributes: ['pseudo'],
      include: [
        {
          attributes: [],
          model: Follower.unscoped(),
          as: 'followers',
          where: { followerId },
        },
      ],
      transaction,
      raw: true,
      nest: true,
      limit,
      offset,
      subQuery: false,
    });
    return { followed, total };
  }

  static getDynamicLevel(note) {
    if (note <= 4) return DynamicLevel.DES_JOURS_MEILLEURS;
    if ((note <= 6) && (note > 4)) return DynamicLevel.COUCI_COUCA;
    return DynamicLevel.EN_FORME;
  }

  static getCoeffAndNote(message, messageOrder, nbMessages) {
    if (!message) return [0, 0];
    const nbDaysAgo = moment(message.publicationDate).diff(moment(), 'day');
    const note = EmotionNote[message.emotionCode];
    const coeff = Math.sqrt(nbMessages - messageOrder) / (1 + nbDaysAgo);
    return [note, coeff];
  }

  static computeAverageNote(messages) {
    const coeffsAndNotes = messages.map((message, messageOrder) => UserService.getCoeffAndNote(message, messageOrder, messages.length));
    const [valueSum, weightSum] = coeffsAndNotes.reduce(([vSum, wSum], [value, weight]) =>
      ([vSum + value * weight, wSum + weight]), [0, 0]);
    return valueSum / weightSum;
  }

  static async updateDynamic(userId, { transaction = null } = {}) {
    const messages = await Message.unscoped().findAll({
      transaction,
      where: { userId },
      attributes: ['publishedAt', 'emotionCode'],
      order: [['publishedAt', 'desc']],
      limit: 3,
      raw: true,
    });
    if (!messages.length) return User.update({ dynamic: DynamicLevel.NOUVEAU }, { transaction, where: { id: userId } });
    const note = UserService.computeAverageNote(messages);
    return User.update({ dynamic: UserService.getDynamicLevel(note) }, { transaction, where: { id: userId } });
  }
}
