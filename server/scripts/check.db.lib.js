import Sequelize from 'sequelize';
import _ from 'server/helpers/lodash';
import expect from 'server/helpers/test.framework';
import { sequelize } from 'orm';
import { TestError } from 'server/helpers/errors';
import { promiseMapSeries } from 'server/helpers/promise';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

const compareColsTypes = (colDB, colSeq, tableName, colName) => {
  if (tableName === 'SequelizeMeta') return;
  if (colDB.type !== colSeq.type.toSql()) {
    const seqType = colSeq.type.toSql();
    let isEqual;
    if (seqType === 'VARCHAR(255)') {
      isEqual = colDB.type === 'CHARACTER VARYING';
    } else if (seqType === 'FLOAT') {
      isEqual = colDB.type === 'DOUBLE PRECISION';
    } else if (seqType === 'DECIMAL') {
      isEqual = colDB.type === 'NUMERIC';
    } else if (seqType === 'TEXT[]') {
      isEqual = colDB.type === 'ARRAY';
    } else if (seqType === 'INTEGER[]') {
      isEqual = colDB.type === 'ARRAY';
    } else if (seqType === 'ENUM') {
      isEqual = colDB.type === 'USER-DEFINED';
    } else if (seqType === 'TIME') {
      isEqual = colDB.type === 'TIME WITHOUT TIME ZONE';
    } else if (seqType === 'VARCHAR(255)[]') {
      isEqual = colDB.type === 'ARRAY';
    } else if (seqType.match(/^enum_[a-z_]+\[\]$/g)) {
      isEqual = colDB.type === 'ARRAY';
    } else {
      logger.debug(`test: ${seqType} !== ${colDB.type} at ${tableName}.${colName}`);
      throw new Error(`${seqType} is not supported by db check`);
    }
    if (!isEqual) throw new Error(`${seqType} !== ${colDB.type} at ${tableName}.${colName}`);
  }
};
const assertAllowNullCoherent = (colDB, colSeq, tableName, name) => {
  const allowNullSeq = colSeq.allowNull === undefined ? true : colSeq.allowNull;
  const allowNullDB = colDB.allowNull === undefined ? true : colDB.allowNull;
  const allowNullOk = allowNullSeq === allowNullDB;
  const msg = `${tableName}.${name}: DB expects allowNull to equal ${allowNullDB} while Sequalize  is set to ${allowNullSeq} `;
  expect(allowNullOk, msg).to.be.true();
};

const compareCols = (name, seqModel, dbModel, tableName, isView) => {
  const colSeq = seqModel[name];
  expect(colSeq).to.not.be.null();
  expect(colSeq).to.not.be.undefined();

  const colDB = dbModel[colSeq.field];
  expect(colDB).to.not.be.null();
  expect(colDB, `Missing field ${colSeq.field} on model ${tableName}`).to.not.be.undefined();
  const dbIsPK = _.has(colSeq, 'primaryKey') && colSeq.primaryKey;
  // PK in the DB is optimistic and fires true even if it's a FK,
  // so we do the check in one direction.
  if (colSeq.primaryKey) {
    if (!dbIsPK) {
      logger.debug('test: PK error');
    }
    expect(dbIsPK).to.equal(true);
  }
  compareColsTypes(colDB, colSeq, tableName, name);
  if (!isView) {
    assertAllowNullCoherent(colDB, colSeq, tableName, name);
  }
};

const isRealCol = col => !(col.type instanceof Sequelize.DataTypes.VIRTUAL);

const checkTable = (seqModelFull, dbModel, tableName) => {
  const dbValues = _.values(dbModel);
  const seqModel = _.pickBy(seqModelFull.attributes, isRealCol);
  const modelValues = _.values(seqModel);
  const sameNumberCols = dbValues.length === modelValues.length;
  if (!sameNumberCols) {
    logger.debug(dbValues);
    logger.debug(modelValues);
  }
  const isView = seqModelFull.isView;
  const msg = `The model ${tableName} has ${modelValues.length} ` +
    `cols while the DB has ${dbValues.length} cols.`;
  expect(sameNumberCols, msg).to.be.true();
  Object.keys(seqModel).map(name => compareCols(name, seqModel, dbModel, tableName, isView));

  if (dbValues.length !== modelValues.length) {
    logger.debug(dbValues.length);
    logger.debug(modelValues.length);
    logger.debug(tableName);
    logger.debug(_.values(seqModel.attributes));
    throw new Error();
  }
  expect(dbValues.length).to.equal(modelValues.length);
  return Promise.resolve();
};

const checkTables = (tableNamesDb) => {
  const removeSeqMeta = modelsName => modelsName.filter(name => name !== 'SequelizeMeta');
  const tableNamesSeq = removeSeqMeta(_.values(sequelize.models).filter(model => !model.isView).map(x => x.getTableName()));
  const expectedNumberOfTables = tableNamesSeq.length;
  const tableNamesDbFiltered = removeSeqMeta(tableNamesDb);
  const goodNumberOfTables = expectedNumberOfTables === tableNamesDbFiltered.length;

  if (!goodNumberOfTables) {
    logger.debug(tableNamesSeq);
    logger.debug(tableNamesSeq.length);
    logger.debug(tableNamesDbFiltered);
    logger.debug(tableNamesDbFiltered.length);
    logger.debug(_.difference(tableNamesSeq, tableNamesDbFiltered));
    logger.debug(_.difference(tableNamesDbFiltered, tableNamesSeq));
  }
  expect(tableNamesDbFiltered.length).to.equal(expectedNumberOfTables);
  return Promise.resolve();
};

const getTable = async (tableName) => {
  try {
    return await sequelize.getQueryInterface().describeTable(tableName);
  } catch (e) {
    throw new TestError(`Table ${tableName} wasn't found in the db while it exists in the model.`);
  }
};

const checkAllIndexConstraintsQuery = async () => {
  const results = await sequelize.query(`
  SELECT c.conrelid::regclass AS "table",
         /* list of key column names in order */
         string_agg(a.attname, ',' ORDER BY x.n) AS columns,
         pg_catalog.pg_size_pretty(
            pg_catalog.pg_relation_size(c.conrelid)
         ) AS size,
         c.conname AS constraint,
         c.confrelid::regclass AS referenced_table
  FROM pg_catalog.pg_constraint c
     /* enumerated key column numbers per foreign key */
     CROSS JOIN LATERAL
        unnest(c.conkey) WITH ORDINALITY AS x(attnum, n)
     /* name for each key column */
     JOIN pg_catalog.pg_attribute a
        ON a.attnum = x.attnum
           AND a.attrelid = c.conrelid
  WHERE NOT EXISTS
          /* is there a matching index for the constraint? */
          (SELECT 1 FROM pg_catalog.pg_index i
           WHERE i.indrelid = c.conrelid
             /* the first index columns must be the same as the key columns, but order doesn't matter */
             AND (i.indkey::smallint[])[0:cardinality(c.conkey)-1] @> c.conkey)
    AND c.contype = 'f'
  GROUP BY c.conrelid, c.conname, c.confrelid
  ORDER BY pg_catalog.pg_relation_size(c.conrelid) DESC;
  `,
  { type: sequelize.QueryTypes.SELECT });
  expect(results).to.deep.equal([], 'Missing indexes for foreign key');
};

const dbCheck = () => {
  const queryInterface = sequelize.getQueryInterface();
  const tables = _.values(sequelize.models).map(async (seqModelFull) => {
    const tableName = seqModelFull.getTableName();
    const dbModel = await getTable(tableName);
    return checkTable(seqModelFull, dbModel, tableName);
  });
  const db = queryInterface.showAllTables()
    .then(tableNamesDb => checkTables(tableNamesDb));

  const checkMissingIndexes = checkAllIndexConstraintsQuery();

  return promiseMapSeries([db, ...tables, checkMissingIndexes]);
};

export default dbCheck;
