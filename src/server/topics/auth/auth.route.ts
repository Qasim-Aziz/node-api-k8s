import { AuthController } from 'src/server/topics/auth/auth.controller';
import Router from 'src/server/abstracts/router';
import {UserController} from "../user/user.controller";

const userRoutes = new Router();

userRoutes
  .addRoute('/login', {
    post: { handler: AuthController.login },
  })
  .addRoute('/logout', {
    post: { handler: AuthController.logout },
  })
  .addRoute('/register', {
    post: { handler: AuthController.register },
  })
  .addRoute('/forget-password', {
    post: { handler: UserController.forgetPassword },
  })
  .addRoute('/reset-password', {
    post: { handler: UserController.resetPassword },
  });

export default userRoutes.getRouter();
