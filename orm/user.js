import _ from 'server/helpers/lodash';
import { getDate } from 'server/helpers/helpers';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

module.exports = function (sequelize, DataTypes) {
  const beforeValidate = async (user, options) => {
    const transaction = options.transaction;
  };

  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { isEmail: true },
      set(value) {
        this.setDataValue('email', (_.isNil(value)) ? value : value.toLowerCase());
      }
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'password_hash'
    },
    phoneAuth: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'phone_auth',
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_admin',
      defaultValue: false
    }
  }, {
    tableName: 'user',
    hooks: { beforeValidate },
  }
  );

  User.associate = (models) => {};

  return User;
};
