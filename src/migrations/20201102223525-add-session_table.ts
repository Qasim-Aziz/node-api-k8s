/* eslint-disable */
import Sequelize from "sequelize";

const lib = require('./lib/lib');

module.exports = {
  up: async () => {
    await lib.createTable('session', {
      sid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastRefreshTime: {
        field: 'last_refresh_time',
        type: Sequelize.DATE,
        allowNull: false,
      },
      loginAt: {
        field: 'login_at',
        type: Sequelize.DATE,
        allowNull: false,
      },
      logoutAt: {
        field: 'logout_at',
        type: Sequelize.DATE,
        allowNull: true,
      },
      userId: {
        field: 'user_id',
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    })
    await lib.wrapCommands([
      lib.createFkV3('session', 'user', lib.FOREIGN_KEY_ACTIONS.NO_ACTION )
    ]);
  },
  down: async () => {

  }
};
