import { TropheeController } from 'src/server/topics/trophee/trophee.controller';
import Router from 'src/server/abstracts/router';

const tropheeRoutes = new Router();

tropheeRoutes
  .addRoute('/', {
    post: { handler: TropheeController.setTrophee },
  });

export default tropheeRoutes.getRouter();
