/* eslint-disable */
import Sequelize, { DataTypes } from "sequelize";

const lib = require('./lib/lib');

const TROPHEES_CODES = {
  BADGE_1: 'BADGE_1',
  BADGE_2: 'BADGE_2',
  BADGE_3: 'BADGE_3',
  BADGE_4: 'BADGE_4',
  BADGE_5: 'BADGE_5',
  BADGE_6: 'BADGE_6',
  BADGE_7: 'BADGE_7',
  BADGE_8: 'BADGE_8',
  BADGE_9: 'BADGE_9',
};

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
      added_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
        defaultValue: DataTypes.NOW,
      },
    };

    const tropheeFields = {
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
      offered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      trophee_code: {
        type: Sequelize.ENUM,
        values: Object.values(TROPHEES_CODES),
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
        allowNull: true,
      },
      loved_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    };

    const favoriteFields = {
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
      added_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    };

    await lib.createTable('message', messageFields);
    await lib.createTable('trait', traitFields);
    await lib.createTable('tag', tagFields);
    await lib.createTable('view', viewingFields);
    await lib.createTable('love', heartFields);
    await lib.createTable('favorite', favoriteFields);
    await lib.createTable('trophee', tropheeFields);
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
