import CommentController from 'src/server/topics/comment/comment.controller';
import Router from 'src/server/abstracts/router';

const commentRoutes = new Router();

commentRoutes
  .addRoute('/', {
    post: { handler: CommentController.createComment },
    get: { handler: CommentController.getComments },
  })
  .addRoute('/:commentId', {
    put: { handler: CommentController.updateComment },
    delete: { handler: CommentController.deleteComment },
  })
  .addRoute('/:commentId/love', {
    post: { handler: CommentController.loveComment },
  });

export default commentRoutes.getRouter();
