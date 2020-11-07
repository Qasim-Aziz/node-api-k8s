import {
  DataTypes, makeOneToMany, OrmModel, sequelize,
} from 'src/orm/database';
import { moment } from 'src/server/helpers';
import { User } from 'src/orm/user';

export class Comment extends OrmModel {
  public text!: string;

  public user!: User;

  public postedAt!: moment.Moment;

  public likesCount!: number;

  public commentsCount!: number;

  public comments!: Comment[];
}

Comment.init({
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'posted_at',
  },
  likesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'likes_count',
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'comments_count',
  },
}, { sequelize, tableName: 'comment' });

makeOneToMany(User, Comment, 'userId', false);
Comment.hasOne(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'comments', foreignKey: 'parentId' });
