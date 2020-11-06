import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class Love extends OrmModel {
  public id!: number;

  public lovedAt!: Date;

  public userId!: number;

  public messageId!: number;
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
});

User.hasMany(Love, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

Love.belongsTo(User);

Message.hasMany(Love, {
  sourceKey: 'id',
  foreignKey: 'messageId',
});

Love.belongsTo(Message);
