import { Auth, Joi, validation } from 'src/server/helpers';
import CommentService from 'src/server/topics/comment/comment.service';

export default class CommentController {
  @validation({
    params: {
      messageId: Joi.number().integer().required(),
    },
    body: {
      content: Joi.string().required(),
    },
  })
  @Auth.forLogged()
  static async createComment(req, { transaction = null } = {}) {
    const {
      body: { content }, user: { id: userId }, params: { messageId },
    } = req;
    const comment = await CommentService.addComment(messageId, userId, content, { transaction });
    return { comment };
  }

  @validation({
    body: {
      params: {
        messageId: Joi.number().integer().required(),
      },
    },
  })
  @Auth.forLogged()
  static async getComments(req, { transaction = null } = {}) {
    const { params: { messageId } } = req;
    const comments = await CommentService.getComments(messageId, { transaction });
    return { comments };
  }

  @validation({
    body: {
      params: {
        messageId: Joi.number().integer().required(),
        commentId: Joi.number().integer().required(),
      },
      body: {
        content: Joi.string().required(),
      },
    },
  })
  @Auth.forLogged()
  static async updateComment(req, { transaction = null } = {}) {
    const { params: { messageId, commentId }, body: { content }, user: { id: userId } } = req;
    const comment = await CommentService.updateComment(messageId, commentId, userId, content, { transaction });
    return { comment };
  }

  @validation({
    body: {
      params: {
        messageId: Joi.number().integer().required(),
        commentId: Joi.number().integer().required(),
      },
    },
  })
  @Auth.forLogged()
  static async deleteComment(req, { transaction = null } = {}) {
    const { params: { messageId, commentId }, user: { id: userId } } = req;
    const comment = await CommentService.deleteComment(messageId, commentId, userId, { transaction });
    return { comment };
  }

  @validation({
    body: {
      params: {
        messageId: Joi.number().integer().required(),
        commentId: Joi.number().integer().required(),
      },
    },
  })
  @Auth.forLogged()
  static async loveComment(req, { transaction = null } = {}) {
    const { params: { messageId, commentId }, user: { id: userId } } = req;
    const comment = await CommentService.loveComment(messageId, commentId, userId, { transaction });
    return { comment };
  }
}
