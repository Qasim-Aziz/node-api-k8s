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
      lib.createFkV3('trophee', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('trophee', 'message', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('favorite', 'message', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
      lib.createFkV3('favorite', 'user', lib.FOREIGN_KEY_ACTIONS.CASCADE, { onUpdateAction: lib.FOREIGN_KEY_ACTIONS.CASCADE }),
    ]);
    await lib.wrapCommands([
      lib.createUniqueIndex('trait_name', 'trait', ['name']),
      lib.createUniqueIndex('love_user_message', 'love', ['user_id', 'message_id']),
      lib.createUniqueIndex('trophee_user_message', 'trophee', ['user_id', 'message_id']),
      lib.createUniqueIndex('favorite_user_message', 'favorite', ['user_id', 'message_id']),
      lib.createUniqueIndex('pseudo', 'user', ['pseudo']),
      lib.createUniqueIndex('email', 'user', ['email']),
      lib.createUniqueIndex('trait_message', 'tag', ['trait_id', 'message_id'], { nullableField: 'message_id' }),
      lib.createUniqueIndex('trait_user', 'tag', ['trait_id', 'user_id'], { nullableField: 'user_id' }),
      lib.addCheck('tag', 'user_message_xor',
        '(user_id is null and message_id is not null) or (user_id is not null and message_id is null)'),
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
