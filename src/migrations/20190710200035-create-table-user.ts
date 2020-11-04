import Sequelize from 'sequelize';
import * as lib from './lib/lib';

module.exports = {
  up: () => lib.createTable('user', {
    email: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    passwordHash: {
      type: Sequelize.TEXT,
      allowNull: false,
      field: 'password_hash',
    },
    pseudo: {
      type: Sequelize.TEXT,
      allowNull: false,
      field: 'pseudo',
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'is_admin',
      defaultValue: false,
    },
  }),

  down: () => {},
};
