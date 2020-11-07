import { DataTypes } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { EMOTION_CODE, PRIVACY_LEVEL } from 'src/server/constants';
import { User } from 'src/orm/user';

export class Message extends OrmModel {
  public content!: string;

  public publishedAt!: Date;

  public emotionCode!: string;

  public privacy!: string;

  public user!: User;
}

Message.init({
  content: {
    type: DataTypes.TEXT,
    field: 'content',
    allowNull: false,
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at',
    allowNull: false,
  },
  emotionCode: {
    type: DataTypes.ENUM,
    values: Object.values(EMOTION_CODE),
    field: 'emotion_code',
    allowNull: false,
  },
  privacy: {
    type: DataTypes.ENUM,
    values: Object.values(PRIVACY_LEVEL),
    field: 'privacy',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'message',
});

makeOneToMany(User, Message, 'userId', true);
