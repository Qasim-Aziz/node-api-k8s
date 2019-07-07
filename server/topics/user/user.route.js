import express from 'express';
import { routeTo } from 'server/helpers/routes.helpers';
import { UserController } from 'server/topics/user/user.controller';

class UserRouter {
  constructor() {
    this._router = express.Router(); // eslint-disable-line new-cap
  }

  build() {
    this._assignUserRoute();
    return this._router;
  }

  _assignUserRoute() { // refactor with medical teams routes
    const c = new UserController();

    this._router.route('/')
      .get(routeTo(c, c.get));
  }
}


export const userRoutes = new UserRouter().build();
