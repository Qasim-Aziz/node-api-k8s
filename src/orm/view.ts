import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class View extends OrmModel {
  public id!: number;

  public viewedAt!: Date;

  public userId!: number;

  public messageId!: number;
}

View.init({
  viewedAt: {
    type: DataTypes.DATE,
    field: 'viewed_at',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'view',
});

User.hasMany(View, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

Message.hasMany(View, {
  sourceKey: 'id',
  foreignKey: 'messageId',
});
