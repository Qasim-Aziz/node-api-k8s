import { UserSession } from 'src/server/acl/user.session';
import { Transaction } from 'sequelize';

declare namespace Express {
  export interface Request {
    user?: UserSession,
    transaction: Transaction,
  }

  export interface Response {
    _contentLength: number;
  }
}
