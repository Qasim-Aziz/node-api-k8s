import Router from 'src/server/abstracts/router';
import { UserController } from 'src/server/topics/user/user.controller';

const userRoutes = new Router();

userRoutes
  .addRoute('/by-email', {
    get: { handler: UserController.getByEmail },
  })
  .addRoute('/by-pseudo', {
    get: { handler: UserController.getByPseudo },
  });

export default userRoutes.getRouter();
