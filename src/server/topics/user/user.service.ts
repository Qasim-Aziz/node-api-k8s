import { User } from 'src/orm';

export default class UserService {
  static async checkEmailExist(email, { transaction = null } = {}) {
    return User.count({ where: { email }, transaction })
      .then((count) => count !== 0);
  }

  static async checkPseudoExist(pseudo, { transaction = null } = {}) {
    return User.count({ where: { pseudo }, transaction })
      .then((count) => count !== 0);
  }
}
