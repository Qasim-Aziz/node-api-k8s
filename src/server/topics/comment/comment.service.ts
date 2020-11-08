import {
  Comment, Love, User,
} from 'src/orm';
import { BackError, moment } from 'src/server/helpers';
import httpStatus from 'http-status';

export default class CommentService {
  static async getComments(messageId, { transaction = null } = {}) {
    return Comment.scope('messageComment').findAll({
      include: [{
        model: User.scope('userComment'),
      }],
      where: {
        messageId,
        parentId: null,
      },
      transaction,
    });
  }

  static async getComment(commentId, { transaction = null } = {}) {
    return Comment.scope('messageComment').findByPk(commentId, {
      include: [{
        model: User.scope('userComment'),
      }],
      transaction,
    });
  }

  static async addComment(messageId, userId, content, { transaction = null } = {}) {
    const { id: commentId } = await Comment.create({
      messageId,
      userId,
      content,
      postedAt: moment(),
    }, { transaction });

    return CommentService.getComment(commentId, { transaction });
  }

  static async updateComment(messageId, commentId, userId, content, { transaction = null } = {}) {
    const comment = await CommentService.getComment(commentId, { transaction });
    if (comment.user.id !== userId) {
      throw new BackError('Cannot update comment', httpStatus.FORBIDDEN);
    }
    await comment.update({ content }, { transaction });
    console.log(comment.toJSON());
    return comment;
  }

  static async loveComment(messageId, commentId, userId, { transaction = null } = {}) {
    const love = await Love.unscoped().findOne({ where: { messageId, commentId, userId }, transaction });
    const comment = await CommentService.getComment(commentId, { transaction });
    if (love) {
      await love.destroy({ transaction });
      comment.lovesCount -= 1;
    } else {
      await Love.create({ messageId, commentId, userId }, { transaction });
      comment.lovesCount += 1;
    }
    await comment.save({ transaction });
    console.log(comment.toJSON());
    return comment;
  }

  static async deleteComment(messageId, commentId, userId, content, { transaction = null } = {}) {
    const comment = await CommentService.getComment(commentId, { transaction });
    if (comment.user.id !== userId) {
      throw new BackError('Cannot delete comment', httpStatus.FORBIDDEN);
    }
    await comment.destroy({ transaction });
    return comment;
  }
}
