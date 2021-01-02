import { DataTypes } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { User } from 'src/orm/user';

export class Session extends OrmModel {
  public sid!: string;

  public expire!: Date;

  public lastRefreshTime!: Date;

  public loginAt!: Date;

  public logoutAt!: Date;

  public user!: User;

  public userId!: number;
}

Session.init({
  sid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  lastRefreshTime: {
    field: 'last_refresh_time',
    type: DataTypes.DATE,
    allowNull: false,
  },
  loginAt: {
    field: 'login_at',
    type: DataTypes.DATE,
    allowNull: false,
  },
  logoutAt: {
    field: 'logout_at',
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'session',
  modelName: 'session',
});

makeOneToMany(User, Session, 'userId', false);
