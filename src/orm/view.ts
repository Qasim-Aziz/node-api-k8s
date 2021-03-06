import { DataTypes, fn } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class View extends OrmModel {
  public viewedAt!: Date;

  public user!: User;

  public messageId!: Message;
}

View.init({
  viewedAt: {
    type: DataTypes.DATE,
    field: 'viewed_at',
    allowNull: false,
    defaultValue: fn('now'),
  },
}, {
  sequelize,
  tableName: 'view',
  modelName: 'view',
});

makeOneToMany(User, View, 'userId', false);
makeOneToMany(Message, View, 'messageId', false);
