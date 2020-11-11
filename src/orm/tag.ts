import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { Message } from 'src/orm/message';

export class Tag extends OrmModel {
  public message!: Message;
}

Tag.init({}, { sequelize, tableName: 'tag', modelName: 'tag' });

makeOneToMany(Message, Tag, 'messageId', false);
