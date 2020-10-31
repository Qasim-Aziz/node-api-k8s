import Sequelize from 'sequelize';
import { sequelize } from 'src/orm/database';

const getCallerFile = () => {
  const originalPrepareStackTrace = Error.prepareStackTrace;
  let callerFile;
  try {
    const err = new Error('This is a fake error designed to get the caller trace of a function.');
    Error.prepareStackTrace = (error, stack) => stack;
    // @ts-ignore
    const currentFile = err.stack.shift().getFileName();

    while (err.stack.length) {
      // @ts-ignore
      callerFile = err.stack.shift().getFileName();
      if (currentFile !== callerFile && getParentFolder(callerFile) === 'migrations') break;
    }
  } catch (e) {} // eslint-disable-line no-empty
  Error.prepareStackTrace = originalPrepareStackTrace;
  return callerFile;
};

const getParentFolder = (filePath) => {
  const pathWithoutFilename = filePath.substring(0, filePath.lastIndexOf('/'));
  return pathWithoutFilename.substring(pathWithoutFilename.lastIndexOf('/') + 1);
};

const getMigrationDate = () => {
  const filePath = getCallerFile();
  const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
  return fileName.substring(0, 8);
};

exports.FOREIGN_KEY_ACTIONS = {
  CASCADE: 'CASCADE',
  SET_NULL: 'SET NULL',
  NO_ACTION: 'NO ACTION',
  RESTRICT: 'RESTRICT',
};

exports.addColumn = function (tableName, colName, type,
  { defaultValue = null, allowNull = true } = {}) {
  const formattedDefaultValue = Array.isArray(defaultValue) ? `{${defaultValue.join(',')}}` : defaultValue;
  const defaultValueStr = (defaultValue !== null) ? ` DEFAULT '${formattedDefaultValue}'` : '';
  const allowNullStr = allowNull ? '' : 'NOT NULL ';
  return `
DO $$
  BEGIN
    ALTER TABLE "${tableName}" ADD COLUMN "${colName}" ${type} ${allowNullStr}${defaultValueStr};
  EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column ${colName} already exists in ${tableName}.';
END; $$  LANGUAGE plpgsql;;
`;
};

exports.addCheck = function addCheck(tableName, checkName, check) {
  return `ALTER TABLE "public"."${tableName}"
ADD CONSTRAINT ${checkName} CHECK (${check});
`;
};
exports.dropCheck = function dropCheck(tableName, checkName) {
  return `ALTER TABLE "public"."${tableName}"
DROP CONSTRAINT IF EXISTS ${checkName};
`;
};

exports.alterColumn = function alterColumn(tableName, colName, statement) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" ${statement};`;
};

exports.alterColumnSetDefault = function alterColumn(tableName, colName, defaultValue) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" SET DEFAULT ${defaultValue === null ? 'NULL' : `'${defaultValue}'`};`;
};

exports.alterColumnDropDefault = function alterColumn(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" DROP DEFAULT;`;
};

exports.dropColumn = function dropColumn(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" DROP COLUMN IF EXISTS "${colName}";`;
};

exports.dropTable = function dropTable(tableName) {
  return `DROP TABLE IF EXISTS ${tableName} CASCADE;`;
};

exports.renameColumn = function renameColumn(tableName, oldName, newName) {
  return `ALTER TABLE "public"."${tableName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
};

exports.buildEnumName = (tableName, colName) => `enum_${tableName}_${colName}`;

exports.createEnum = function (enumName, values) {
  return `
    CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});
`;
};

exports.dropView = function (viewName, { ifExists = false } = {}) {
  return `drop view ${ifExists ? 'if exists ' : ' '}${viewName};`;
};

exports.updateView = function (viewName, sql) {
  return [
    exports.dropView(viewName, { ifExists: true }),
    `Create view ${viewName} as ${sql}`,
  ].join('\n');
};

exports.renameTable = function (oldName, newName) {
  return `ALTER TABLE ${oldName} RENAME TO ${newName};`;
};

exports.setNotNull = function setNotNull(tableName, columnName) {
  return `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} SET NOT NULL;`;
};

exports.removeNotNull = function setNotNull(tableName, columnName) {
  return `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} DROP NOT NULL;`;
};

exports.addColumnEnum = function (tableName, colName, values,
  { enumName = null, defaultValue = null, allowNull = true } = {}) {
  const enumName_ = enumName || exports.buildEnumName(tableName, colName);
  const createEnumType = exports.createEnum(enumName_, values);
  const addEnumCol = exports.addColumn(tableName, colName, enumName_, { defaultValue, allowNull });
  return [createEnumType, addEnumCol].join('\n');
};
exports.makeColumnNullable = function makeColumnNullable(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" DROP NOT NULL;`;
};
exports.makeColumnNotNullable = function (tableName, colName, { defaultValue = null } = {}) {
  const notNull = `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" SET NOT NULL;`;
  if (defaultValue === null) return notNull;
  return [
    `update "${tableName}" set "${colName}" = '${defaultValue}' where "${colName}" is null;`,
    notNull,
  ].join('\n');
};

exports.dropEnum = function dropEnum(colName) {
  return `DROP TYPE "${colName}";`;
};

exports.renameEnum = function renameEnum(oldName, newName) {
  return `ALTER TYPE "${oldName}" RENAME TO "${newName}";`;
};

exports.makeForeignKey = function makeForeignKey(tableName, allowNull, { keyName = 'id', onUpdate = null, onDelete = null } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20191217') throw new Error('makeForeignKey is deprecated. Please create a normal column and use createFkV3.');
  return {
    field: `${tableName}_${keyName}`,
    allowNull,
    type: Sequelize.INTEGER,
    references: {
      model: tableName,
      key: keyName,
    },
    ...(onUpdate ? { onUpdate } : {}),
    ...(onDelete ? { onDelete } : {}),
  };
};
exports.createFKBase = function createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20190924') throw new Error('createFKBase is now deprecated. Please use createFkBaseV2.');
  return `
    ALTER TABLE "${tableFrom}"
    ADD FOREIGN KEY ("${fieldFrom}")
    REFERENCES "${tableTo}" ("${fieldTo}")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
`;
};

exports.createFkBaseV2 = function createFkBaseV2(tableFrom, tableTo, fieldFrom, fieldTo, onDeleteAction, onUpdateAction) {
  return `
    ALTER TABLE "${tableFrom}"
    ADD FOREIGN KEY ("${fieldFrom}")
    REFERENCES "${tableTo}" ("${fieldTo}")
    ON DELETE ${onDeleteAction}
    ON UPDATE ${onUpdateAction};
`;
};

exports.createFK = function createFK(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20190924') throw new Error('createFK is now deprecated. Please use createFkV3.');
  const indexName = `index_${tableFrom}_${fieldFrom}`;
  return [
    exports.createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo }),
    exports.createIndex(indexName, tableFrom, [fieldFrom]),
  ].join('\n');
};

exports.createFkV2 = function createFkV2(tableFrom, tableTo, { fieldFrom = null, fieldTo = 'id' } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20190924') throw new Error('createFkV2 is now deprecated. Please use createFkV3.');
  const fieldFrom_ = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  return exports.createFK(tableFrom, tableTo, fieldFrom_, { fieldTo });
};

exports.createFkV3 = function createFkV3(tableFrom, tableTo, onDeleteAction, {
  fieldFrom = null,
  fieldTo = 'id',
  onUpdateAction = exports.FOREIGN_KEY_ACTIONS.CASCADE,
} = {}) {
  const resolvedFieldFrom = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  const indexName = `index_${tableFrom}_${resolvedFieldFrom}`;
  return [
    exports.createFkBaseV2(tableFrom, tableTo, resolvedFieldFrom, fieldTo, onDeleteAction, onUpdateAction),
    exports.createIndex(indexName, tableFrom, [resolvedFieldFrom]),
  ].join('\n');
};

exports.removeFkConstraint = function dropFk(tableName, fkName) {
  return `ALTER TABLE "${tableName}" DROP CONSTRAINT "${fkName}"; `;
};

exports.changeFkType = function changeFkType(tableFrom, tableTo, newOnDelete, {
  fieldFrom = null,
  fieldTo = 'id',
  fkName = null,
  newOnUpdate = exports.FOREIGN_KEY_ACTIONS.CASCADE,
} = {}) {
  const resolvedFieldFrom = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  const resolvedFkName = fkName === null ? `${tableFrom}_${resolvedFieldFrom}_fkey` : fkName;
  return [
    exports.dropConstraint(resolvedFkName, tableFrom),
    exports.createFkBaseV2(tableFrom, tableTo, resolvedFieldFrom, fieldTo, newOnDelete, newOnUpdate),
  ].join('\n');
};

exports.changeColumnType = function changeColumnType(tableName, columnName, newType, { using = null } = {}) {
  const usingStr = using !== null ? `USING ${using}` : '';
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${columnName}" `
    + `SET DATA TYPE ${newType} ${usingStr};`;
};

exports.changeValuesEnum = async function changeValuesEnum(tableColumns, enumName, values) {
  await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" RENAME TO "${enumName}_old";`);
  await queryInterface.sequelize.query(`CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});`);
  for (const tableColumn of tableColumns) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableColumn.table}" ALTER COLUMN "${tableColumn.column}" TYPE ${enumName} USING ${tableColumn.column}::text::${enumName};`,
    );
  }
  await queryInterface.sequelize.query(`DROP TYPE "${enumName}_old";`);
};

exports.changeValuesEnumInArray = async function changeValuesEnumInArray(tableColumns, enumName, values) {
  await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" RENAME TO "${enumName}_old";`);
  await queryInterface.sequelize.query(`CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});`);
  for (const tableColumn of tableColumns) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableColumn.table}" ALTER COLUMN "${tableColumn.column}" TYPE ${enumName}[] USING ${tableColumn.column}::text::${enumName}[];`,
    );
  }
  await queryInterface.sequelize.query(`DROP TYPE "${enumName}_old";`);
};

exports.createUniqueIndex = function createUniqueIndex(indexName, table, fields) {
  return `\
CREATE UNIQUE INDEX ${indexName}_deleted_unique ON ${table}
USING btree (${fields.join(', ')}, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX ${indexName}_unique ON ${table} USING btree (${fields.join(', ')}) WHERE deleted_at IS NULL;
`;
};

exports.createIndex = function createIndex(indexName, table, fields) {
  return `\
CREATE INDEX "${indexName}" ON "public"."${table}"(${fields.join(', ')});
`;
};

function getDefaultFields() {
  return {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deleted_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  };
}

const queryInterface = sequelize.getQueryInterface();

exports.createTable = function createTable(tableName, fields, { transaction = null } = {}) {
  return Promise.resolve(queryInterface.createTable(tableName, {

    ...getDefaultFields(),
    ...fields,
  }, { }));
};

exports.dropIndex = function dropIndex(indexName) {
  return `\
DROP INDEX IF EXISTS ${indexName};
`;
};

exports.dropConstraint = function dropConstraint(indexName, table) {
  return `\
ALTER TABLE ${table} DROP CONSTRAINT  ${indexName};
`;
};

exports.dropUniqueIndex = function dropUniqueIndex(indexName) {
  return exports.dropIndex(`${indexName}_deleted_unique`) + exports.dropIndex(`${indexName}_unique`);
};

exports.insertRow = function (tableName, row, { createdAt = 'NOW()', updatedAt = 'NOW()' } = {}) {
  const keys = Object.keys(row);
  return `\
INSERT INTO "${tableName}" ("${keys.join('", "')}", "created_at", "updated_at")
  VALUES ('${keys.map((k) => row[k]).join("', '")}', ${createdAt}, ${updatedAt});
`;
};

exports.createAuditTrigger = function createAuditTrigger(tableName) {
  return `CREATE TRIGGER ${tableName}_audit AFTER DELETE ON ${tableName} FOR EACH ROW EXECUTE PROCEDURE if_modified_func();`;
};

exports.updateRows = function (tableName, fieldValues, conditions = null) {
  const where = conditions ? `
WHERE ${conditions.map((constraint, field) => `${field} ${constraint}`).join(' AND ')};` : ';';
  return `\
UPDATE ${tableName}
SET ${fieldValues.map((value, field) => `${field} = ${value}`).join(', ')}${where}
`;
};

exports.wrapCommands = function wrapCommands(commands = []) {
  return Promise.resolve(queryInterface.sequelize.query(`${commands.join('\n')};`));
};
