import { InitDataController } from 'src/server/topics/init-data/init-data.controller';
import Router from 'src/server/abstracts/router';

const initDataRoutes = new Router();

initDataRoutes
  .addRoute('/', {
    post: { handler: InitDataController.initData },
  });

export default initDataRoutes.getRouter();
