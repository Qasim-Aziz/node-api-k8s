import { transactionContext } from 'src/server/helpers';
import { CookiesManager } from 'src/server/acl/cookies-manager';
import { SessionManager } from 'src/server/acl/session-manager';

export const requestHandlerMiddleware = (method) =>
  async (req, res, next) => {
    try {
      const response = await transactionContext(async (transaction) => {
        const request = {
          body: req.body,
          params: req.params,
          query: req.query,
          user: req.user,
          token: SessionManager.getToken(req),
        };
        const controllerOpts = {
          transaction,
          cookiesManager: new CookiesManager(res),
        };
        return method(request, controllerOpts);
      });
      res.json(response || {});
    } catch (error) {
      next(error);
    }
  };
