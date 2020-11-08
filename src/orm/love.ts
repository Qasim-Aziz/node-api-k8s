import { moment } from 'src/server/helpers';
import {
  DataTypes, makeOneToMany, OrmModel, sequelize,
} from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';
import { Comment } from 'src/orm/comment';

export class Love extends OrmModel {
  public lovedAt = moment();

  public user!: User;

  public message!: Message;

  public comment!: Comment;
}

Love.init({
  lovedAt: {
    type: DataTypes.DATE,
    field: 'loved_at',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'love',
  modelName: 'love',
});

makeOneToMany(User, Love, 'userId', false);
makeOneToMany(Message, Love, 'messageId', true);
makeOneToMany(Comment, Love, 'commentId', true);
