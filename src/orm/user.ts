import { DataTypes } from "sequelize";
import { OrmModel, sequelize } from "src/orm/database";
import { Utils } from "src/server/helpers";

export class User extends OrmModel{
  public id!: number;
  public email!: string;
  public passwordHash!: string;
  public pseudo!: string;
  public isAdmin!: boolean;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { isEmail: true },
    set(value: string) {
      this.setDataValue('email', (Utils.isNil(value)) ? value : value.toLowerCase());
    }
  },
  passwordHash: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'password_hash'
  },
  pseudo: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'pseudo',
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_admin',
    defaultValue: false,
  }
}, {
  sequelize,
  tableName: 'user',
})
