import { DataTypes, fn } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';
import { TropheeCode } from 'src/server/constants';

export class Trophee extends OrmModel {
  public offeredAt!: Date;

  public user!: User;

  public message!: Message;

  public tropheeCode!: string;
}

Trophee.init({
  offeredAt: {
    type: DataTypes.DATE,
    field: 'offered_at',
    allowNull: false,
    defaultValue: fn('now'),
  },
  tropheeCode: {
    type: DataTypes.ENUM,
    values: Object.values(TropheeCode),
    field: 'trophee_code',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'trophee',
  modelName: 'trophee',
});

makeOneToMany(User, Trophee, 'userId', false);
makeOneToMany(Message, Trophee, 'messageId', false);
