import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';
import { Utils } from 'src/server/helpers';
import { DynamicLevel } from "src/server/constants";

export class User extends OrmModel {
  public email!: string;

  public passwordHash!: string;

  public pseudo!: string;

  public description!: string;

  public isAdmin!: boolean;

  public nbConsecutiveConnexionDays!: number;

  public totalScore!: number;

  public remindingScore!: number;

  public lastConnexionDate!: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { isEmail: true },
    set(value: string) {
      this.setDataValue('email', (Utils.isNil(value)) ? value : value.toLowerCase());
    },
  },
  dynamic: {
    type: DataTypes.ENUM,
    values: Object.values(DynamicLevel),
    field: 'dynamic',
    allowNull: false,
    defaultValue: DynamicLevel.NOUVEAU,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash',
  },
  pseudo: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'pseudo',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
  },
  lastConnexionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_connexion_date',
  },
  nbConsecutiveConnexionDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'nb_consecutive_connexion_days',
  },
  totalScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_score',
  },
  remindingScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'reminding_score',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_admin',
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'user',
  modelName: 'user',
});

// Scopes
User.addScope('userComment', {
  attributes: ['id', 'pseudo'],
});
