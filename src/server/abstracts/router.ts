import express from 'express';
import {
  apiExpireHeader, apiSessionManager, initSessionUser, apiRequestValidator, apiRequest,
} from 'src/server/middlewares/api.middlewares';

interface Action {
  handler: (req: express.Request, reqOpts) => void;
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
      apiExpireHeader,
      initSessionUser,
    ];
    if (!method.forAll) {
      middlewares.push(apiSessionManager);
    }

    if (method.validation) {
      middlewares.push(apiRequestValidator(method.validation));
    }

    middlewares.push(apiRequest(method));
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
