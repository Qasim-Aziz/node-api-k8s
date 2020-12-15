import {
  Comment, Love, User,
} from 'src/orm';
import { Sequelize } from 'src/orm/database';
import { BackError, moment } from 'src/server/helpers';
import httpStatus from 'http-status';
import UserService from "../user/user.service";

export default class CommentService {
  static async getComments(messageId, {
    offset = 0, limit = 10, userId = null, transaction = null,
  } = {}) {
    const { count: total, rows: comments } = await Comment.scope('messageComment').findAndCountAll({
      attributes: [
        'id',
        'content',
        'postedAt',
        'lovesCount',
        [Sequelize.literal('"loves".id IS NOT NULL'), 'loved'],
        [Sequelize.literal(`"user".id = ${userId}`), 'isOwner'],
      ],
      include: [
        {
          model: User.scope('userComment'),
        }, {
          model: Love.unscoped(), attributes: [], where: { userId }, required: false,
        },
      ],
      where: {
        messageId,
        parentId: null,
      },
      transaction,
    });
    return { comments, total };
  }

  static async getComment(commentId, { userId = null, transaction = null } = {}) {
    return Comment.scope('messageComment').findByPk(commentId, {
      attributes: [
        'id',
        'content',
        'postedAt',
        'lovesCount',
        [Sequelize.literal('"loves".id IS NOT NULL'), 'loved'],
        [Sequelize.literal(`"user".id = ${userId}`), 'isOwner'],
      ],
      include: [{
        model: User.scope('userComment'),
      }, {
        model: Love.unscoped(), attributes: [], where: { userId }, required: false,
      }],
      transaction,
    });
  }

  static async addComment({ messageId, userId, content }, { transaction = null } = {}) {
    const { id: commentId } = await Comment.create({
      messageId,
      userId,
      content,
      postedAt: moment(),
    }, { transaction });
    await UserService.updateUserScore(userId, { commentId, transaction });
    return CommentService.getComment(commentId, { userId, transaction });
  }

  static async updateComment(commentId, userId, content, { transaction = null } = {}) {
    const comment = await CommentService.getComment(commentId, { userId, transaction });
    if (comment.user.id !== userId) {
      throw new BackError('Cannot update comment', httpStatus.FORBIDDEN);
    }
    await comment.update({ content }, { transaction });
    await UserService.updateUserScore(userId, { commentId, transaction });
    return comment;
  }

  static async loveComment(commentId, userId, { transaction = null } = {}) {
    const love = await Love.unscoped().findOne({ where: { commentId, userId }, transaction });
    const comment = await CommentService.getComment(commentId, { userId, transaction });
    if (love) {
      await love.destroy({ transaction });
      comment.lovesCount -= 1;
      comment.setDataValue('loved', false);
    } else {
      await Love.create({ commentId, userId }, { transaction });
      comment.lovesCount += 1;
      comment.setDataValue('loved', true);
    }
    await comment.save({ transaction });
    return comment;
  }

  static async deleteComment(commentId, userId, content, { transaction = null } = {}) {
    const comment = await CommentService.getComment(commentId, { userId, transaction });
    if (comment.user.id !== userId) {
      throw new BackError('Cannot delete comment', httpStatus.FORBIDDEN);
    }
    await UserService.updateUserScore(userId, { commentId, transaction, deleteCase: true });
    await comment.destroy({ transaction });
    return comment;
  }
}
