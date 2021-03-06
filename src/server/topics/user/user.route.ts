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
    put: { handler: UserController.updateMe },
  })
  .addRoute('/:userId', {
    get: { handler: UserController.getUser },
  })
  .addRoute('/:userId/refreshUserLastConnexionDate', {
    post: { handler: UserController.refreshUserLastConnexionDate },
  })
  .addRoute('/:userId/followOrUnfollow', {
    post: { handler: UserController.followOrUnfollow },
  })
  .addRoute('/:userId/followers', {
    get: { handler: UserController.getFollowers },
  })
  .addRoute('/:userId/followed', {
    get: { handler: UserController.getFollowed },
  });

export default userRoutes.getRouter();
