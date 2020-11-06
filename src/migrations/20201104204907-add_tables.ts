/* eslint-disable */
import Sequelize from "sequelize";

const lib = require('./lib/lib');

const EMOTION_CODES = {
  APAISE: 'APAISE',
  CONTENT: 'CONTENT',
  DECU: 'DECU',
  CHOQUE: 'CHOQUE',
  DEPITE: 'DEPITE',
  DEPRIME: 'DEPRIME',
  EFFONDRE: 'EFFONDRE',
  ENERVE: 'ENERVE',
  HEUREUX: 'HEUREUX',
  INCOMPRIS: 'INCOMPRIS',
  LASSE: 'LASSE',
  LEGER: 'LEGER',
  NERVEUX: 'NERVEUX',
  SURPRIS: 'SURPRIS',
  TRISTE: 'TRISTE',
};

const PRIVACY_LEVEL = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
};

module.exports = {
  up: async () => {
    const messageFields = {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      emotion_code: {
        type: Sequelize.ENUM,
        values: Object.values(EMOTION_CODES),
        allowNull: false,
      },
      privacy: {
        type: Sequelize.ENUM,
        values: Object.values(PRIVACY_LEVEL),
        allowNull: false,
      },
    };

    const traitFields = {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
    };

    const tagFields = {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      trait_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    };

    const viewingFields = {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    };

    const heartFields = {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      loved_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    };

    await lib.createTable('message', messageFields);
    await lib.createTable('trait', traitFields);
    await lib.createTable('tag', tagFields);
    await lib.createTable('view', viewingFields);
    await lib.createTable('love', heartFields);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
      Example:
      return queryInterface.dropTable('users');
    */
  }
};
