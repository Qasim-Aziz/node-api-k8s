import express from 'express';
import { UserSession } from 'src/server/acl/user.session';
import { SessionManager } from 'src/server/acl/session-manager';
import { BackError } from 'src/server/helpers';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { clsUserLoggerMiddleware } from 'src/server/middlewares/cls_logger_middleware';
import { SESSION_ERRORS } from 'src/server/constants';

export const initSessionUser = (req, res, next) => {
  req.user = new UserSession();
  next();
};

export const sessionManager = express.Router();
sessionManager.use([
  async (req, res, next) => {
    try {
      console.log('here');
      await SessionManager.getUserSession(req);
      next();
    } catch (error) {
      if (!(error instanceof BackError)) throw new BackError(error);
      if (error.status === SESSION_ERRORS.EXPIRED_SESSION.STATUS) CookiesManager.clearCookies(res);
      if (error.status === SESSION_ERRORS.BAD_REQUEST.STATUS) next();
      else res.status(error.status).json({ code: error.code, message: error.message });
    }
  },
  clsUserLoggerMiddleware(),
]);
