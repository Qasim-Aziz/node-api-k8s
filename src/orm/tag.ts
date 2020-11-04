import { OrmModel, sequelize } from 'src/orm/database';
import { Trait } from 'src/orm/trait';
import { Message } from 'src/orm/message';

export class Tag extends OrmModel {
  public id!: number;

  public traitId!: number;

  public messageId!: number;
}

Tag.init({}, { sequelize, tableName: 'tag' });

Trait.hasMany(Tag, {
  sourceKey: 'id',
  foreignKey: 'traitId',
});

Message.hasMany(Tag, {
  sourceKey: 'id',
  foreignKey: 'messageId',
});
