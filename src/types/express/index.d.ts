import { UserSession } from 'src/server/acl/user.session';

declare namespace Express {
  export interface Request {
    user?: UserSession,
  }

  export interface Response {
    _contentLength: number;
  }
}
