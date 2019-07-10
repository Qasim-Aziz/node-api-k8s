const lib = require('./lib/lib');

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    const createTable = `
CREATE TABLE "user" (
    "id" serial,
    "email" text NOT NULL,
    "phone" text NOT NULL,
    "password_hash" text NOT NULL,
    "is_admin" boolean NOT NULL default false,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "deleted_at" timestamp with time zone
);
`;

    return lib.wrapCommands(queryInterface, [createTable]);
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
