import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';
import { EMOTION_CODE, PRIVACY_LEVEL } from 'src/server/constants';
import { User } from 'src/orm/user';

export class Message extends OrmModel {
  public id!: number;

  public content!: string;

  public publishedAt!: Date;

  public emotionCode!: string;

  public privacy!: string;

  public isPrivate!: boolean;

  public isPublic!: boolean;
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
  isPrivate: {
    type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['privacy']),
    get() {
      return this.get('privacy') === PRIVACY_LEVEL.PRIVATE;
    },
  },
  isPublic: {
    type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['privacy']),
    get() {
      return this.get('privacy') === PRIVACY_LEVEL.PUBLIC;
    },
  },
}, {
  sequelize,
  tableName: 'message',
});

User.hasMany(Message, {
  sourceKey: 'id',
  foreignKey: 'userId',
});
