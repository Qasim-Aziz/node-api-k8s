/* eslint-disable */
import Sequelize from "sequelize";

const lib = require('./lib/lib');

module.exports = {
  up: async () => {
    await lib.createTable('follower', {
      followerId: {
        field: 'follower_id',
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      followedId: {
        field: 'followed_id',
        type: Sequelize.INTEGER,
        allowNull: false,
      }
    })
    await lib.wrapCommands([
      lib.createFkV3('follower', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { fieldFrom: 'follower_id' } ),
      lib.createFkV3('follower', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { fieldFrom: 'followed_id' } ),
      lib.addCheck('follower', 'check_data', 'follower_id IS NOT NULL AND followed_id IS NOT NULL'),
    ]);
  },
  down: async () => {

  }
};
