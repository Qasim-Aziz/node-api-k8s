import express from 'express';
import {
  addExpiresHeaderMiddleware, sessionManager, initSessionUser, validateRequestMiddleware,
} from 'src/server/middlewares/req.middleware';
import { transactionContext } from 'src/server/helpers';

interface Action {
  handler: (res: express.Request, req: express.Response) => void;
}

interface RouteActions {
  get?: Action;
  post?: Action;
  delete?: Action;
  put?: Action;
}

export default class Router {
  readonly router;

  constructor() {
    this.router = express.Router(); // eslint-disable-line new-cap
  }

  routeTo = (method) => {
    const middlewares = [
      addExpiresHeaderMiddleware,
      initSessionUser,
    ];

    if (!method.forAll) {
      middlewares.push(sessionManager);
    }

    if (method.validation) {
      middlewares.push(validateRequestMiddleware(method.validation));
    }

    middlewares.push((req, res, next) => transactionContext(async (transaction) => {
      req.transaction = transaction;
      return Promise.resolve(method.call(null, req, res, next)).catch((e) => next(e));
    }));
    return middlewares;
  };

  addRoute(path: string, actions: RouteActions): Router {
    const route = this.router.route(path);
    Object.keys(actions).forEach((method) => {
      const action = actions[method];
      const handler = this.routeTo(action.handler);
      route[method](handler);
    });
    return this;
  }

  getRouter() {
    return this.router;
  }
}
