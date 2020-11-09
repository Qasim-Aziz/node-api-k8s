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
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      field: 'description',
    },
    lastConnexionDate: {
      type: Sequelize.DATE,
      allowNull: false,
      field: 'last_connexion_date',
    },
    nbConsecutiveConnexionDays: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'nb_consecutive_connexion_days',
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
