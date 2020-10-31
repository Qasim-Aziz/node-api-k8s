import { AuthController } from 'src/server/topics/auth/auth.controller';
import Router from "src/server/abstracts/router";

const c = new AuthController();

const userRoutes = new Router();

userRoutes
  .addRoute('/login', {
    post: { handler: c.login }
  })
  .addRoute('/logout', {
    post: { handler: c.logout }
  })
  .addRoute('/register', {
    post: { handler: c.register }
  });

export default userRoutes.getRouter();

