import { AuthController } from 'src/server/topics/auth/auth.controller';
import Router from 'src/server/abstracts/router';

const userRoutes = new Router();

userRoutes
  .addRoute('/login', {
    post: { handler: AuthController.login },
  })
  .addRoute('/logout', {
    post: { handler: AuthController.logout },
  })
  .addRoute('/registerPatient', {
    post: { handler: AuthController.registerPatient },
  })
  .addRoute('/forget-password', {
    post: { handler: AuthController.forgetPassword },
  })
  .addRoute('/reset-password', {
    post: { handler: AuthController.resetPassword },
  });

export default userRoutes.getRouter();
