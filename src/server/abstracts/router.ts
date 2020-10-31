import express from 'express';
import addExpiresHeaderMiddleware from "../middlewares/add_expires_header_middleware";
import logRequestMiddleware from "../middlewares/log_request";
import validate_request_middleware from "../middlewares/validate_request_middleware";

interface Action {
  handler: (res: express.Request, req: express.Response) => {};
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

  routeTo(method) {
    const middlewares = []
    // const middlewares = [
    //   addExpiresHeaderMiddleware,
    //   logRequestMiddleware,
    // ];
    //
    // if (method.validation) {
    //   middlewares.push(validate_request_middleware(method.validation));
    // }

    middlewares.push((req, res, next) => {
      Promise.resolve(method.call(null, req, res, next)).catch((e) => next(e));
    });
    return middlewares;
  }

  addRoute(path: string, actions: RouteActions): Router {
    const route = this.router.route(path);
    for (const [method, action] of Object.entries(actions)) {
      const handler = this.routeTo(action.handler);
      route[method](handler);
    }
    return this;
  }

  getRouter() {
    return this.router;
  }
}
