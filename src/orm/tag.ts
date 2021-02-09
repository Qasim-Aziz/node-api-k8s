import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { Message } from 'src/orm/message';
import { User } from 'src/orm/user';

export class Tag extends OrmModel {
  public message!: Message;

  public user!: User;
}

Tag.init({}, { sequelize, tableName: 'tag', modelName: 'tag' });

makeOneToMany(Message, Tag, 'messageId', true);
makeOneToMany(User, Tag, 'userId', true);
