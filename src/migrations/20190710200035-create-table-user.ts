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
      allowNull: true,
      field: 'last_connexion_date',
    },
    nbConsecutiveConnexionDays: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'nb_consecutive_connexion_days',
    },
    totalScore: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_score',
    },
    remindingScore: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'reminding_score',
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
