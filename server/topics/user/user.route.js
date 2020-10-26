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

  _assignUserRoute() {
    const c = new UserController();

    this._router.route('/by-email')
      .get(routeTo(c, c.getByEmail));

    this._router.route('/by-pseudo')
      .get(routeTo(c, c.getByPseudo));
  }
}


export const userRoutes = new UserRouter().build();
