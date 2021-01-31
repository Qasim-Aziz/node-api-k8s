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

export const FOREIGN_KEY_ACTIONS = {
  CASCADE: 'CASCADE',
  SET_NULL: 'SET NULL',
  NO_ACTION: 'NO ACTION',
  RESTRICT: 'RESTRICT',
};

export const addColumn = function (tableName, colName, type,
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

export const addCheck = function addCheck(tableName, checkName, check) {
  return `ALTER TABLE "public"."${tableName}"
ADD CONSTRAINT ${checkName} CHECK (${check});
`;
};
export const dropCheck = function dropCheck(tableName, checkName) {
  return `ALTER TABLE "public"."${tableName}"
DROP CONSTRAINT IF EXISTS ${checkName};
`;
};

export const alterColumn = function alterColumn(tableName, colName, statement) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" ${statement};`;
};

export const alterColumnSetDefault = function alterColumn(tableName, colName, defaultValue) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" SET DEFAULT ${defaultValue === null ? 'NULL' : `'${defaultValue}'`};`;
};

export const alterColumnDropDefault = function alterColumn(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" DROP DEFAULT;`;
};

export const dropColumn = function dropColumn(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" DROP COLUMN IF EXISTS "${colName}";`;
};

export const dropTable = function dropTable(tableName) {
  return `DROP TABLE IF EXISTS ${tableName} CASCADE;`;
};

export const renameColumn = function renameColumn(tableName, oldName, newName) {
  return `ALTER TABLE "public"."${tableName}" RENAME COLUMN "${oldName}" TO "${newName}";`;
};

export const buildEnumName = (tableName, colName) => `enum_${tableName}_${colName}`;

export const createEnum = function (enumName, values) {
  return `
    CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});
`;
};

export const dropView = function (viewName, { ifExists = false } = {}) {
  return `drop view ${ifExists ? 'if exists ' : ' '}${viewName};`;
};

export const updateView = (viewName, sql) => {
  return [
     dropView(viewName, { ifExists: true }),
    `Create view ${viewName} as ${sql}`,
  ].join('\n');
};

export const renameTable = function (oldName, newName) {
  return `ALTER TABLE ${oldName} RENAME TO ${newName};`;
};

export const setNotNull = function setNotNull(tableName, columnName) {
  return `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} SET NOT NULL;`;
};

export const removeNotNull = function setNotNull(tableName, columnName) {
  return `ALTER TABLE ${tableName} ALTER COLUMN ${columnName} DROP NOT NULL;`;
};

export const addColumnEnum = function (tableName, colName, values,
  { enumName = null, defaultValue = null, allowNull = true } = {}) {
  const enumName_ = enumName || buildEnumName(tableName, colName);
  const createEnumType = createEnum(enumName_, values);
  const addEnumCol = addColumn(tableName, colName, enumName_, { defaultValue, allowNull });
  return [createEnumType, addEnumCol].join('\n');
};
export const makeColumnNullable = function makeColumnNullable(tableName, colName) {
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" DROP NOT NULL;`;
};
export const makeColumnNotNullable = function (tableName, colName, { defaultValue = null } = {}) {
  const notNull = `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${colName}" SET NOT NULL;`;
  if (defaultValue === null) return notNull;
  return [
    `update "${tableName}" set "${colName}" = '${defaultValue}' where "${colName}" is null;`,
    notNull,
  ].join('\n');
};

export const dropEnum = function dropEnum(colName) {
  return `DROP TYPE "${colName}";`;
};

export const renameEnum = function renameEnum(oldName, newName) {
  return `ALTER TYPE "${oldName}" RENAME TO "${newName}";`;
};

export const makeForeignKey = function makeForeignKey(tableName, allowNull, { keyName = 'id', onUpdate = null, onDelete = null } = {}) {
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
export const createFKBase = function createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
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

export const createFkBaseV2 = function createFkBaseV2(tableFrom, tableTo, fieldFrom, fieldTo, onDeleteAction, onUpdateAction) {
  return `
    ALTER TABLE "${tableFrom}"
    ADD FOREIGN KEY ("${fieldFrom}")
    REFERENCES "${tableTo}" ("${fieldTo}")
    ON DELETE ${onDeleteAction}
    ON UPDATE ${onUpdateAction};
`;
};

export const createFK = function createFK(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20190924') throw new Error('createFK is now deprecated. Please use createFkV3.');
  const indexName = `index_${tableFrom}_${fieldFrom}`;
  return [
    createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo }),
    createIndex(indexName, tableFrom, [fieldFrom]),
  ].join('\n');
};

export const createFkV2 = function createFkV2(tableFrom, tableTo, { fieldFrom = null, fieldTo = 'id' } = {}) {
  const migrationDate = getMigrationDate();
  if (migrationDate >= '20190924') throw new Error('createFkV2 is now deprecated. Please use createFkV3.');
  const fieldFrom_ = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  return createFK(tableFrom, tableTo, fieldFrom_, { fieldTo });
};

export const createFkV3 = function createFkV3(tableFrom, tableTo, onDeleteAction, {
  fieldFrom = null,
  fieldTo = 'id',
  onUpdateAction = FOREIGN_KEY_ACTIONS.CASCADE,
} = {}) {
  const resolvedFieldFrom = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  const indexName = `index_${tableFrom}_${resolvedFieldFrom}`;
  return [
    createFkBaseV2(tableFrom, tableTo, resolvedFieldFrom, fieldTo, onDeleteAction, onUpdateAction),
    createIndex(indexName, tableFrom, [resolvedFieldFrom]),
  ].join('\n');
};

export const removeFkConstraint = function dropFk(tableName, fkName) {
  return `ALTER TABLE "${tableName}" DROP CONSTRAINT "${fkName}"; `;
};

export const changeFkType = function changeFkType(tableFrom, tableTo, newOnDelete, {
  fieldFrom = null,
  fieldTo = 'id',
  fkName = null,
  newOnUpdate = FOREIGN_KEY_ACTIONS.CASCADE,
} = {}) {
  const resolvedFieldFrom = fieldFrom === null ? `${tableTo}_id` : fieldFrom;
  const resolvedFkName = fkName === null ? `${tableFrom}_${resolvedFieldFrom}_fkey` : fkName;
  return [
    dropConstraint(resolvedFkName, tableFrom),
    createFkBaseV2(tableFrom, tableTo, resolvedFieldFrom, fieldTo, newOnDelete, newOnUpdate),
  ].join('\n');
};

export const changeColumnType = function changeColumnType(tableName, columnName, newType, { using = null } = {}) {
  const usingStr = using !== null ? `USING ${using}` : '';
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${columnName}" `
    + `SET DATA TYPE ${newType} ${usingStr};`;
};

export const changeValuesEnum = async function changeValuesEnum(tableColumns, enumName, values) {
  await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" RENAME TO "${enumName}_old";`);
  await queryInterface.sequelize.query(`CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});`);
  for (const tableColumn of tableColumns) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableColumn.table}" ALTER COLUMN "${tableColumn.column}" TYPE ${enumName} USING ${tableColumn.column}::text::${enumName};`,
    );
  }
  await queryInterface.sequelize.query(`DROP TYPE "${enumName}_old";`);
};

export const changeValuesEnumInArray = async function changeValuesEnumInArray(tableColumns, enumName, values) {
  await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" RENAME TO "${enumName}_old";`);
  await queryInterface.sequelize.query(`CREATE TYPE "${enumName}" AS ENUM (${values.map((x) => `'${x}'`).join(', ')});`);
  for (const tableColumn of tableColumns) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "${tableColumn.table}" ALTER COLUMN "${tableColumn.column}" TYPE ${enumName}[] USING ${tableColumn.column}::text::${enumName}[];`,
    );
  }
  await queryInterface.sequelize.query(`DROP TYPE "${enumName}_old";`);
};

export const createUniqueIndex = function createUniqueIndex(indexName, table, fields, { nullableField = null } = {}) {
  return `\
CREATE UNIQUE INDEX ${indexName}_deleted_unique ON "${table}"
USING btree (${fields.join(', ')}, deleted_at) WHERE deleted_at IS NOT NULL
${nullableField ? `AND ${nullableField} is NOT NULL` : ''};
CREATE UNIQUE INDEX ${indexName}_unique ON "${table}" USING btree (${fields.join(', ')}) WHERE deleted_at IS NULL
${nullableField ? `AND ${nullableField} is NOT NULL` : ''};
`;
};

export const createIndex = function createIndex(indexName, table, fields) {
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

export const createTable = function createTable(tableName, fields, { transaction = null } = {}) {
  return Promise.resolve(queryInterface.createTable(tableName, {

    ...getDefaultFields(),
    ...fields,
  }, { }));
};

export const dropIndex = function dropIndex(indexName) {
  return `\
DROP INDEX IF EXISTS ${indexName};
`;
};

export const dropConstraint = function dropConstraint(indexName, table) {
  return `\
ALTER TABLE ${table} DROP CONSTRAINT  ${indexName};
`;
};

export const dropUniqueIndex = function dropUniqueIndex(indexName) {
  return dropIndex(`${indexName}_deleted_unique`) + dropIndex(`${indexName}_unique`);
};

export const insertRow = function (tableName, row, { createdAt = 'NOW()', updatedAt = 'NOW()' } = {}) {
  const keys = Object.keys(row);
  return `\
INSERT INTO "${tableName}" ("${keys.join('", "')}", "created_at", "updated_at")
  VALUES ('${keys.map((k) => row[k]).join("', '")}', ${createdAt}, ${updatedAt});
`;
};

export const createAuditTrigger = function createAuditTrigger(tableName) {
  return `CREATE TRIGGER ${tableName}_audit AFTER DELETE ON ${tableName} FOR EACH ROW EXECUTE PROCEDURE if_modified_func();`;
};

export const updateRows = function (tableName, fieldValues, conditions = null) {
  const where = conditions ? `
WHERE ${conditions.map((constraint, field) => `${field} ${constraint}`).join(' AND ')};` : ';';
  return `\
UPDATE ${tableName}
SET ${fieldValues.map((value, field) => `${field} = ${value}`).join(', ')}${where}
`;
};

export const wrapCommands = function wrapCommands(commands = []) {
  return Promise.resolve(queryInterface.sequelize.query(`${commands.join('\n')};`));
};
