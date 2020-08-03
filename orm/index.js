import path from 'path';
import Sequelize from 'sequelize';
import _ from 'server/helpers/lodash';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

const PG_USER = process.env.PG_USER || 'postgres';
const PG_PASSWORD = process.env.PG_PASSWORD || 'password'; // In pg_hba trust, all passwords are accepted ..
const PG_HOST = process.env.PG_HOST || 'localhost';
const PG_PORT = process.env.PG_PORT || 5432;
const PG_DATABASE = process.env.PG_DATABASE || 'jardinsecret';
const databaseUrl = process.env.DATABASE_URL || `postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;

const sequelizeOptions = (databaseUrl.indexOf('localhost') !== -1) ? {} : {
  dialect: 'postgres'
};
const logSQL = process.env.SQL !== undefined ? console.log : false; // eslint-disable-line no-console

const sequelize = new Sequelize(databaseUrl, Object.assign(sequelizeOptions, {
  define: {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: true,

    // rename the columns to lowercase
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    // don't delete database entries but set the newly added attribute deletedAt
    // to the current date (when deletion was done). paranoid will only work if
    // timestamps are enabled

    paranoid: true,

    // disable the modification of tablenames; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,
    underscored: true,
    underscoredAll: true,
  },
  logging: logSQL,
  pool: {
    max: 15,
    min: 0,
    idle: 1000
  },
}));

const getModel = (name) => {
  const model = sequelize.import(path.join(__dirname, name));
  model.isSequelizeModel = true;
  return model;
};

export const User = getModel('user.js');

_.forIn(exports, (model) => {
  if (model && model.associate) {
    model.associate(exports);
  }
});
export { sequelize };
