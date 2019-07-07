/* eslint-disable */
// Copy pasted from sequelize-cli

import { Sequelize } from 'sequelize/lib/sequelize';
import fs from 'fs';
import { sequelize } from 'orm'

const Umzug = require('umzug');
const helpers = require('sequelize-cli/lib/helpers');
import logger from 'server/helpers/logger';

export function tryToMigrateFromOldSchema() {
  var queryInterface = sequelize.getQueryInterface();

  return queryInterface.showAllTables()
    .then(function (tableNames) {
      if (tableNames.indexOf('SequelizeMeta') === -1) {
        throw new Error('No SequelizeMeta table found.');
      }
    })
    .then(function () {
      return queryInterface.describeTable('SequelizeMeta');
    })
    .then(function (table) {
      if (JSON.stringify(Object.keys(table).sort()) === JSON.stringify(['id', 'from', 'to'])) {
        return;
      }
      return queryInterface.renameTable('SequelizeMeta', 'SequelizeMetaBackup')
        .then(function () {
          var sql = queryInterface.QueryGenerator.selectQuery('SequelizeMetaBackup');

          return helpers.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
        })
        .then(function (result) {
          var timestamps = result.map(function (item) {
            return item.to;
          });
          var files = fs.readdirSync(helpers.path.getPath('migration'));

          return files.filter(function (file) {
            var match = file.match(/(\d+)-?/);

            if (match) {
              var timestamp = match[0].replace('-', '');

              return timestamps.indexOf(timestamp) > -1;
            }
          });
        })
        .then(function (files) {
          var SequelizeMeta = sequelize.define('SequelizeMeta', {
            name: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
              primaryKey: true,
              autoIncrement: false
            }
          }, {
            tableName: 'SequelizeMeta',
            timestamps: false
          });

          return SequelizeMeta.sync().then(function () {
            return SequelizeMeta.bulkCreate(
              files.map(function (file) {
                return { name: file };
              })
            );
          });
        });
    });
}


export function ensureCurrentMetaSchema(migrator) {
  var sequelize = migrator.options.storageOptions.sequelize;
  var columnName = migrator.options.storageOptions.columnName;
  var config = helpers.config.readConfig();

  return sequelize.getQueryInterface()
    .showAllTables()
    .then(function (tables) {
      if (tables.indexOf('SequelizeMeta') === -1) {
        return;
      }

      return sequelize.queryInterface
        .describeTable('SequelizeMeta')
        .then(function (table) {
          var columns = Object.keys(table);

          if ((columns.length === 1) && (columns[0] === columnName)) {
            return;
          } else {
            if (!config.autoMigrateOldSchema) {
              logger.warn('Database schema was not migrated. Please run "sequelize db:migrate:old_schema" first.');
            }
            return tryToMigrateFromOldSchema();
          }
        });
    });
}


export function getMigrator(type) {
  const migrator = new Umzug({
    storage: helpers.umzug.getStorage(type),
    storageOptions: helpers.umzug.getStorageOptions(type, { sequelize: sequelize }),
    logging: require('debug')('migrations'),
    migrations: {
      params: [sequelize.getQueryInterface(), Sequelize],
      path: helpers.path.getPath(type),
      pattern: helpers.config.supportsCoffee() ? /\.js$|\.coffee$/ : /\.js$/,
      wrap: function (fun) {
        if (fun.length === 3) {
          return Bluebird.promisify(fun);
        } else {
          return fun;
        }
      }
    }
  });

  return sequelize
    .authenticate()
    .then(function () {
      return migrator;
    })
    .error(function (err) {
      logger.error('Unable to connect to database: ' + err);
    });
}
