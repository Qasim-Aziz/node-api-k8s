import { Auth, Joi, validation } from 'src/server/helpers';
import CommentService from 'src/server/topics/comment/comment.service';

export default class CommentController {
  @validation({
    body: {
      content: Joi.string().required(),
      messageId: Joi.number().integer().required(),
    },
  })
  @Auth.forLogged()
  static async createComment(req, { transaction = null } = {}) {
    const { body: { content, messageId }, user: { id: userId } } = req;
    const comment = await CommentService.addComment({ messageId, userId, content: content.trim() }, { transaction });
    return { comment };
  }

  @validation({
    body: {
      query: {
        messageId: Joi.number().integer().required(),
        offset: Joi.number().integer().optional().default(0),
        limit: Joi.number().integer().optional().default(10),
      },
    },
  })
  @Auth.forLogged()
  static async getComments(req, { transaction = null } = {}) {
    const { query: { offset, limit, messageId }, user: { id: userId } } = req;
    const { comments, total } = await CommentService.getComments(messageId, {
      offset, limit, userId, transaction,
    });
    return { comments, total };
  }

  @validation({
    body: {
      params: {
        commentId: Joi.number().integer().required(),
      },
      body: {
        content: Joi.string().required(),
      },
    },
  })
  @Auth.forLogged()
  static async updateComment(req, { transaction = null } = {}) {
    const { params: { commentId }, body: { content }, user: { id: userId } } = req;
    const comment = await CommentService.updateComment(commentId, userId, content.trim(), { transaction });
    return { comment };
  }

  @validation({
    body: {
      params: {
        commentId: Joi.number().integer().required(),
      },
    },
  })
  @Auth.forLogged()
  static async deleteComment(req, { transaction = null } = {}) {
    const { params: { commentId }, user: { id: userId } } = req;
    const comment = await CommentService.deleteComment(commentId, userId, { transaction });
    return { comment };
  }

  @validation({
    body: {
      params: {
        commentId: Joi.number().integer().required(),
      },
    },
  })
  @Auth.forLogged()
  static async loveComment(req, { transaction = null } = {}) {
    const { params: { commentId }, user: { id: userId } } = req;
    const comment = await CommentService.loveComment(commentId, userId, { transaction });
    return { comment };
  }
}
