import { AuthController } from 'src/server/topics/auth/auth.controller';
import Router from 'src/server/abstracts/router';

const authRoutes = new Router();

authRoutes
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

export default authRoutes.getRouter();
