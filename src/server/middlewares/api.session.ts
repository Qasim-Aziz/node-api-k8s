import express from 'express';
import { UserSession } from 'src/server/acl/user.session';
import { SessionManager } from 'src/server/acl/session-manager';
import { BackError, Utils } from 'src/server/helpers';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { clsUserLoggerMiddleware } from 'src/server/middlewares/app.logger';
import { SESSION_ERRORS } from 'src/server/constants';

export const initSessionUser = (req, res, next) => {
  req.user = new UserSession();
  next();
};

export const apiSessionManager = express.Router();
apiSessionManager.use([
  async (req, res, next) => {
    try {
      await SessionManager.getUserSession(req);
      next();
    } catch (error) {
      if (!(error instanceof BackError)) throw new BackError(error);
      if (error.status === SESSION_ERRORS.EXPIRED_SESSION.STATUS) (new CookiesManager(res)).clearCookies();
      if (error.status === SESSION_ERRORS.BAD_REQUEST.STATUS) next();
      else res.status(error.status).json(Utils.pick(error, ['code', 'message']));
    }
  },
  clsUserLoggerMiddleware(),
]);
