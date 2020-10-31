import util from 'util';
import childProcess from 'child_process';
import { BackError, logger } from '../server/helpers';
import { sequelize } from '../orm/database';

const queryIdOffsets = (tablesToOmit) => `
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

export default class InitDBService {
  /**
   * Truncates all tables and resets ES indices
   * @param withWorkRelationHashTags
   * @param reload Do not reload every time to prevent memory leak in jest
   * @returns {Promise<void>}
   */
  static async truncateTables({ withWorkRelationHashTags = false, reload = false } = {}) {
    const tables = Object.values(sequelize.models)
      .map((model) => model.getTableName())
      .filter((tableName) => tableName !== 'SequelizeMeta') as string[];
    const tablesToOmit = [];
    const tablesToTruncate = tables.filter((table) => !tablesToOmit.includes(table));
    const tablesToTruncateFormatted = tablesToTruncate.map((table) => `"${table}"`).join(', ');

    if (tables.length !== tablesToOmit.length + tablesToTruncate.length) {
      throw new BackError(`Failed to omit tables in truncate DB, (${tables.length} !== ${tablesToOmit.length} + ${tablesToTruncate.length})`);
    }
    const queryTruncate = tablesToTruncateFormatted === '' ? '' : `TRUNCATE TABLE ${tablesToTruncateFormatted} RESTART IDENTITY CASCADE;`;

    const sql = [queryTruncate, queryIdOffsets(tablesToOmit)].join('\n');
    await sequelize.query(sql);
  }

  static async cleanDb() {
    await sequelize.query(`
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
`);
  }

  static async initDb() {
    await InitDBService.cleanDb();
    // migrate
    const exec = util.promisify(childProcess.exec);
    const { stderr } = await exec('npm run migrate');
    if (stderr) {
      logger.error(stderr);
      throw new Error(stderr);
    }
  }
}
