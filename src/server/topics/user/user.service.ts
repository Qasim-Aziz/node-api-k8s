import {
  cast, col, fn,
} from 'sequelize';
import { Message, User } from 'src/orm';
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
        [cast(fn('COUNT', col('"messages"."id"')), 'int'), 'nbMessages'],
      ],
      include: [
        { model: Message.unscoped(), attributes: [], required: false },
      ],
      group: ['"user"."id"'],
      transaction,
      raw: true,
      nest: true,
    });
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
}
