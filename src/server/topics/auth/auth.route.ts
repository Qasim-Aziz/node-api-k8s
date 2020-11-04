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
  .addRoute('/register', {
    post: { handler: AuthController.register },
  });

export default userRoutes.getRouter();
