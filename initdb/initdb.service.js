import _ from 'server/helpers/lodash';

import { sequelize } from 'orm';
import { ensureCurrentMetaSchema, getMigrator } from 'initdb/migrations';
import BackError from 'server/helpers/back.error';

import logger from 'server/helpers/logger';

const queryIdOffsets = `
CREATE TEMPORARY SEQUENCE IF NOT EXISTS id_offsets
  INCREMENT BY 1000
  START WITH 1000;

SELECT pg_catalog.setval(seqs.get_serial_name, nextval('id_offsets' :: REGCLASS))
FROM (
       SELECT
         tc.constraint_name,
         tc.table_name,
         cols.column_name,
         cols.column_default,
         split_part(cols.column_default :: TEXT, $$'$$, 2)                             AS parse_serial_name,
         split_part(pg_get_serial_sequence(tc.table_name, cols.column_name), $$.$$, 2) AS get_serial_name
       FROM information_schema.table_constraints AS tc
         INNER JOIN information_schema.columns AS cols
           ON cols.table_name = tc.table_name AND tc.table_schema = cols.table_schema
       WHERE tc.constraint_type = 'PRIMARY KEY'
             AND tc.table_schema = 'public'
             AND cols.column_name = 'id'
     ) seqs
WHERE parse_serial_name = get_serial_name;
`;

export class InitDBService {
  static migrate() {
    return getMigrator('migration')
      .then(migrator => ensureCurrentMetaSchema(migrator)
        .then(() => migrator.pending())
        .then((migrations) => {
          if (migrations.length === 0) {
            logger.info('No migrations were executed, database schema was already up to date.');
          }
        })
        .then(() => migrator.up())
        .catch((err) => {
          throw err;
        }));
  }

  static async truncateTables() {
    const tables = _.values(sequelize.models).filter(model => !model.isView)
      .map(model => model.getTableName())
      .filter(tableName => tableName !== 'SequelizeMeta');
    const tablesToOmit = [];
    const tablesToTruncate = _.without(tables, ...tablesToOmit);
    const tablesToTruncateFormatted = tablesToTruncate.map(table => `"${table}"`).join(', ');

    if (tables.length !== tablesToOmit.length + tablesToTruncate.length) {
      throw new BackError(`Failed to omit tables in truncate DB, (${tables.length} !== ${tablesToOmit.length} + ${tablesToTruncate.length})`);
    }
    logger.error('tablesToTruncateFormatted : ', tablesToTruncateFormatted)
    const queryTruncate = tablesToTruncateFormatted ? `TRUNCATE TABLE ${tablesToTruncateFormatted} RESTART IDENTITY CASCADE;` : '';

    const sql = [queryTruncate, queryIdOffsets].join('\n');
    await sequelize.query(sql);
  }

  static async cleanDb() {
    await sequelize.query(`
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
`
    );
  }

  static async initDb() {
    await InitDBService.cleanDb();
    return InitDBService.migrate();
  }
}
