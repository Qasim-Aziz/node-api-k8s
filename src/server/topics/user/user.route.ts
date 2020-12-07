import Router from 'src/server/abstracts/router';
import { UserController } from 'src/server/topics/user/user.controller';

const userRoutes = new Router();

userRoutes
  .addRoute('/by-email', {
    get: { handler: UserController.getByEmail },
  })
  .addRoute('/by-pseudo', {
    get: { handler: UserController.getByPseudo },
  })
  .addRoute('/me', {
    get: { handler: UserController.getMe },
  })
  .addRoute('/:userId', {
    get: { handler: UserController.getUser },
    put: { handler: UserController.updateUser },
  })
  .addRoute('/:userId/refreshUserLastConnexionDate', {
    post: { handler: UserController.refreshUserLastConnexionDate },
  });

export default userRoutes.getRouter();
