import express from 'express';
import { routeTo } from 'server/helpers/routes.helpers';
import { AuthController } from 'server/topics/auth/auth.controller';

class AuthRouter {
  constructor() {
    this._router = express.Router(); // eslint-disable-line new-cap
  }

  build() {
    this._assignUserRoute();
    return this._router;
  }

  _assignUserRoute() {
    const c = new AuthController();

    this._router.route('/login')
      .post(routeTo(c, c.login));

    this._router.route('/logout')
      .post(routeTo(c, c.logout));

    this._router.route('/register')
      .post(routeTo(c, c.register));
  }
}


export const authRoutes = new AuthRouter().build();
