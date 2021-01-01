import {
  DataTypes, makeOneToMany, OrmModel, sequelize,
} from 'src/orm/database';
import { moment } from 'src/server/helpers';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class Comment extends OrmModel {
  public content!: string;

  public user!: User;

  public postedAt!: moment.Moment;

  public lovesCount!: number;

  public commentsCount!: number;

  public addedScore!: number;

  public loved!: boolean;

  public comments!: Comment[];
}

Comment.init({
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'posted_at',
  },
  lovesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'loves_count',
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'comments_count',
  },
  addedScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'added_score',
  },
}, { sequelize, tableName: 'comment', modelName: 'comment' });

// Associations
makeOneToMany(Message, Comment, 'messageId', false);
makeOneToMany(User, Comment, 'userId', false);
Comment.hasOne(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'comments', foreignKey: 'parentId' });

// Scopes
Comment.addScope('messageComment', {
  attributes: ['id', 'content', 'postedAt', 'lovesCount', 'commentsCount'],
  order: [['postedAt', 'asc']],
});
