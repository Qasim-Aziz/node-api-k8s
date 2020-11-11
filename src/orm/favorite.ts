import { DataTypes, fn } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class Favorite extends OrmModel {
  public id!: number;

  public addedAt!: Date;

  public userId!: number;

  public messageId!: number;
}

Favorite.init({
  addedAt: {
    type: DataTypes.DATE,
    field: 'added_at',
    allowNull: false,
    defaultValue: fn('now'),
  },
}, {
  sequelize,
  tableName: 'favorite',
  modelName: 'favorite',
});

makeOneToMany(User, Favorite, 'userId', false);
makeOneToMany(Message, Favorite, 'messageId', false);
