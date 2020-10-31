import Router from 'src/server/abstracts/router';
import { UserController } from 'src/server/topics/user/user.controller';

const c = new UserController();

const userRoutes = new Router();

userRoutes
  .addRoute('/by-email', {
    get: { handler: c.getByEmail },
  })
  .addRoute('/by-pseudo', {
    get: { handler: c.getByPseudo },
  });

export default userRoutes.getRouter();
