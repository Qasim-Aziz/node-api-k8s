import { User } from 'src/orm';

export class UserSession {
  id;

  email;

  isLogged = false;

  get userId() {
    return this.id;
  }

  static async getUser(userId, { transaction }) {
    return User.unscoped().findByPk(userId, {
      attributes: ['id', 'email'],
      transaction,
    });
  }

  async getUserSession(userId, { transaction = null } = {}): Promise<UserSession> {
    const user = await UserSession.getUser(userId, { transaction });
    if (!user) {
      throw new Error('User Not found');
    }
    this.id = user.id;
    this.email = user.email;
    this.isLogged = true;
    return this;
  }
}
