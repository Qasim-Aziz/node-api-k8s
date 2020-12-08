import {
  cast, col, fn, Op,
} from 'sequelize';
import { Message, User, Tag, Comment, Follower } from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import httpStatus from 'http-status';
import { DynamicLevel, EmotionNote, PrivacyLevel } from 'src/server/constants';

export default class UserService {
  static async checkEmailExist(email, { transaction = null } = {}) {
    return User.count({ where: { email }, transaction })
      .then((count) => count !== 0);
  }

  static async checkPseudoExist(pseudo, { transaction = null, userId = null } = {}) {
    return User.count({ where: { pseudo, ...userId ? { id: { [Op.not]: userId } } : {} }, transaction })
      .then((count) => count !== 0);
  }

  static async getUser(userId, { transaction = null } = {}) {
    return User.unscoped().findByPk(userId, {
      attributes: [
        'id',
        'pseudo',
        'nbConsecutiveConnexionDays',
        'description',
        'shouldResetPassword',
        'totalScore',
        'remindingScore',
        'dynamic',
        [cast(fn('COUNT', col('"messages"."id"')), 'int'), 'nbMessages'],
        [cast(fn('COUNT', col('"followers"."id"')), 'int'), 'nbFollowers'],
      ],
      include: [
        {
          model: Message.unscoped(), attributes: [], required: false,
        },
        {
          model: Follower.unscoped(), attributes: [], as: 'followers', required: false,
        },
      ],
      group: ['"user"."id"'],
      transaction,
      raw: true,
      nest: true,
    });
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
    const user = await User.unscoped().findByPk(userId, { attributes: ['id', 'totalScore', 'remindingScore'], transaction });
    await User.update(
      {
        totalScore: Math.max(user.totalScore + delta, 0),
        remindingScore: Math.max(user.remindingScore + delta, 0),
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
      if (isPseudoUsed) throw new BackError('Le pseudo est déjà utilisé', httpStatus.BAD_REQUEST);
    }
    await user.update(userData, { transaction });
    return UserService.getUser(userId, { transaction });
  }

  static async updateConnexionInformation(userId, nbConsecutiveConnexionDays, { transaction = null } = {}) {
    await User.update({ nbConsecutiveConnexionDays, lastConnexionDate: moment().toISOString() },
      { where: { id: userId }, transaction });
    return UserService.getUser(userId, { transaction });
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
    return UserService.getUser(followedId, { transaction });
  }

  static async getFollowers(followedId, { transaction = null } = {}) {
    return User.unscoped().findAll({
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
    });
  }

  static async getFollowed(followerId, { transaction = null } = {}) {
    return User.unscoped().findAll({
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
    });
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
