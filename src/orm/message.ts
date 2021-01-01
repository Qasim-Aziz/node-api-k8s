import { DataTypes } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { EmotionCode, PrivacyLevel } from 'src/server/constants';
import { User } from 'src/orm/user';

export class Message extends OrmModel {
  public content!: string;

  public publishedAt!: Date;

  public emotionCode!: EmotionCode;

  public privacy!: PrivacyLevel;

  public user!: User;

  public userId!: number;

  public nbViews!: number;

  public addedScore!: number;
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
    values: Object.values(EmotionCode),
    field: 'emotion_code',
    allowNull: false,
  },
  privacy: {
    type: DataTypes.ENUM,
    values: Object.values(PrivacyLevel),
    field: 'privacy',
    allowNull: false,
  },
  addedScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'added_score',
  },
}, {
  sequelize,
  tableName: 'message',
  modelName: 'message',
});

makeOneToMany(User, Message, 'userId', true);
