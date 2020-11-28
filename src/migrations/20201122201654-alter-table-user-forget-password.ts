/* eslint-disable */
import Sequelize from "sequelize";
import * as lib from './lib/lib';

module.exports = {
  up: async () => lib.wrapCommands( [
      lib.addColumn('user', 'reset_password_code', Sequelize.TEXT, { allowNull: true }),
      lib.addColumn('user', 'reset_password_expires', Sequelize.DATE, { allowNull: true }),
      lib.addColumn('user', 'should_reset_password', Sequelize.BOOLEAN, { allowNull: false, defaultValue: false }),
      ]),
  down: async () => {

  }
};
