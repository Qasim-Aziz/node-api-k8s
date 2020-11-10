import {cast, col, fn, Op} from 'sequelize';
import {Favorite, Love, Message, User, View} from 'src/orm';
import { moment } from 'src/server/helpers';

export default class UserService {
  static async checkEmailExist(email, { transaction = null } = {}) {
    return User.count({ where: { email }, transaction })
      .then((count) => count !== 0);
  }

  static async checkPseudoExist(pseudo, { transaction = null } = {}) {
    return User.count({ where: { pseudo }, transaction })
      .then((count) => count !== 0);
  }

  static async getUser(userId, { transaction = null } = {}) {
    return User.unscoped().findByPk(userId, {
      attributes: [
        'id',
        'pseudo',
        'nbConsecutiveConnexionDays',
        'description',
        [cast(fn('COUNT', col('"Messages"."id"')), 'int'), 'nbMessages'],
      ],
      include: [
        { model: Message.unscoped(), attributes: [], required: false },
      ],
      group: ['"User"."id"'],
      transaction,
      raw: true,
      nest: true,
    });
  }

  static async refreshUserLastConnexionDate(userId, { transaction = null } = {}) {
    const user = await User.unscoped().findByPk(userId, {
      attributes: ['lastConnexionDate', 'nbConsecutiveConnexionDays'],
      transaction,
    });
    const dayDiff = moment(moment().format('MM/DD/YYYY'))
      .diff(moment(moment(user.lastConnexionDate).format('MM/DD/YYYY')), 'days');
    const hasConnectedTwoConsecutiveDays = dayDiff === 1;
    const isSameDay = dayDiff === 0;
    const newNbConsecutiveConnexionDays = hasConnectedTwoConsecutiveDays ? user.nbConsecutiveConnexionDays + 1 : 0;
    await User.update({
      nbConsecutiveConnexionDays: isSameDay ? user.nbConsecutiveConnexionDays : newNbConsecutiveConnexionDays,
      lastConnexionDate: moment().toISOString(),
    }, { where: { id: userId }, transaction });
    return UserService.getUser(userId, { transaction });
  }

  static async getAllFavorites(userId, { transaction = null } = {}) {
    return Message.unscoped().findAll({
      attributes: [
        'id',
        'publishedAt',
        'emotionCode',
        'privacy',
        'content',
        'userId',
        [cast(fn('COUNT', col('"Loves"."id"')), 'int'), 'nbLoves'],
        [cast(fn('COUNT', col('"Views"."id"')), 'int'), 'nbViews'],
      ],
      include: [
        { model: Love.unscoped(), attributes: [] },
        { model: View.unscoped(), attributes: [] },
        { model: Favorite.unscoped(), attributes: [], required: true, where: { userId } },
      ],
      group: ['Message.id'],
      order: [['publishedAt', 'desc']],
      raw: true,
      nest: true,
      transaction,
    });
  }
}
