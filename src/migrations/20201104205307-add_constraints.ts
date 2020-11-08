/* eslint-disable */
const lib = require('./lib/lib');

module.exports = {
  up: async () => {
    await lib.wrapCommands([
      lib.createFkV3('message', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('tag', 'trait', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('tag', 'message', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('love', 'message', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('love', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('view', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('view', 'message', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
    ]);
    await lib.wrapCommands([
      lib.createIndex('trait_name', 'trait', ['name']),
      lib.createUniqueIndex('user_message', 'love', ['user_id', 'message_id']),
      lib.createUniqueIndex('pseudo', 'user', ['pseudo']),
      lib.createUniqueIndex('email', 'user', ['email']),
      lib.createUniqueIndex('trait_message', 'tag', ['trait_id', 'message_id']),
    ]);
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
