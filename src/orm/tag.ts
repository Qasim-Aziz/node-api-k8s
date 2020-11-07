import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { Trait } from 'src/orm/trait';
import { Message } from 'src/orm/message';

export class Tag extends OrmModel {
  public trait!: Trait;

  public message!: Message;
}

Tag.init({}, { sequelize, tableName: 'tag' });

makeOneToMany(Trait, Tag, 'traitId', false);
makeOneToMany(Message, Tag, 'messageId', false);
