import Router from 'src/server/abstracts/router';
import { MessageController } from 'src/server/topics/message/message.controller';

const messageRoutes = new Router();

messageRoutes
  .addRoute('/', {
    get: { handler: MessageController.getAll },
    post: { handler: MessageController.create },
  })
  .addRoute('/next', {
    get: { handler: MessageController.getNext },
  })
  .addRoute('/searchTraits', {
    get: { handler: MessageController.searchTraits },
  })
  .addRoute('/:messageId', {
    get: { handler: MessageController.get },
    put: { handler: MessageController.update },
    delete: { handler: MessageController.delete },
  })
  .addRoute('/:messageId/likeOrUnlike', {
    post: { handler: MessageController.likeOrUnlike },
  });

export default messageRoutes.getRouter();
