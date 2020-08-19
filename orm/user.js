import _ from 'server/helpers/lodash';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
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
      set(value) {
        this.setDataValue('email', (_.isNil(value)) ? value : value.toLowerCase());
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
    //todo define default scope and exclude passwordHash
  }, { tableName: 'user' });
};
