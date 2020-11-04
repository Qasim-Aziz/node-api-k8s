import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';
import { Message } from 'src/orm/message';

export class Like extends OrmModel {
  public id!: number;

  public likedAt!: Date;

  public userId!: number;

  public messageId!: number;
}

Like.init({
  likedAt: {
    type: DataTypes.DATE,
    field: 'liked_at',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'like',
});

User.hasMany(Like, {
  sourceKey: 'id',
  foreignKey: 'userId',
});

Message.hasMany(Like, {
  sourceKey: 'id',
  foreignKey: 'messageId',
});
