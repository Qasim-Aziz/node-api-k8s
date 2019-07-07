const _ = require('lodash'); // eslint-disable-line no-restricted-modules

exports.addColumn = function (tableName, colName, type,
  { defaultValue = null, allowNull = true } = {}) {
  const defaultValueStr = (defaultValue !== null) ? ` DEFAULT '${defaultValue}'` : '';
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
    CREATE TYPE "${enumName}" AS ENUM (${values.map(x => `'${x}'`).join(', ')});
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

exports.deleteEnumValue = function (enumType, enumLabel) {
  return `
DELETE FROM pg_enum
USING pg_type
WHERE pg_enum.enumtypid = pg_type.oid
  AND pg_type.typname = '${enumType}'
  AND pg_enum.enumlabel = '${enumLabel}';
`;
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
  if (_.isNull(defaultValue)) return notNull;
  return [
    `update "${tableName}" set "${colName}" = ${defaultValue} where "${colName}" is null;`,
    notNull
  ].join('\n');
};

exports.dropEnum = function dropEnum(colName) {
  return `DROP TYPE "${colName}";`;
};

exports.renameEnum = function renameEnum(oldName, newName) {
  return `ALTER TYPE "${oldName}" RENAME TO "${newName}";`;
};

exports.renameEnumValue = function alterEnum(enumName, oldName, newName) {
  return `UPDATE pg_enum SET enumlabel = '${newName}'
 WHERE enumlabel = '${oldName}' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = '${enumName}');`;
};

// DEPRECATED
exports.makeForeignKey = function makeForeignKey(tableName, Sequelize, allowNull, { keyName = 'id', onUpdate = null, onDelete = null } = {}) {
  return _.assign({
    field: `${tableName}_${keyName}`,
    allowNull,
    type: Sequelize.INTEGER,
    references: {
      model: tableName,
      key: keyName,
    }
  },
  onUpdate ? { onUpdate } : {},
  onDelete ? { onDelete } : {});
};
exports.createFKBase = function createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
  return `
    ALTER TABLE "${tableFrom}"
    ADD FOREIGN KEY ("${fieldFrom}")
    REFERENCES "${tableTo}" ("${fieldTo}")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
`;
};

exports.createFK = function createFK(tableFrom, tableTo, fieldFrom, { fieldTo = 'id' } = {}) {
  const indexName = `index_${tableFrom}_${fieldFrom}`;
  return [
    exports.createFKBase(tableFrom, tableTo, fieldFrom, { fieldTo }),
    exports.createIndex(indexName, tableFrom, [fieldFrom])
  ].join('\n');
};

exports.createFkV2 = function createFkV2(tableFrom, tableTo, { fieldFrom = null, fieldTo = 'id' } = {}) {
  const fieldFrom_ = _.isNull(fieldFrom) ? `${tableTo}_id` : fieldFrom;
  return exports.createFK(tableFrom, tableTo, fieldFrom_, { fieldTo });
};

exports.changeColumnType = function changeColumnType(tableName, columnName, newType, { using = null } = {}) {
  const usingStr = using !== null ? `USING ${using}` : '';
  return `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${columnName}" ` +
    `SET DATA TYPE ${newType} ${usingStr};`;
};


exports.addValueEnum = function addValueEnum(enumName, valueName) {
  return `ALTER TYPE "${enumName}" ADD VALUE '${valueName}';`;
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

function getDefaultFields(Sequelize) {
  return {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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

exports.createTable = function createTable(queryInterface, Sequelize, tableName, fields, { transaction = null } = {}) {
  return queryInterface.createTable(tableName, _.assign(
    {},
    getDefaultFields(Sequelize),
    fields
  ), { transaction });
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
  const keys = _.keys(row);
  return `\
INSERT INTO "${tableName}" ("${keys.join('", "')}", "created_at", "updated_at")
  VALUES ('${_.map(keys, k => row[k]).join("', '")}', ${createdAt}, ${updatedAt});
`;
};

exports.updateRows = function (tableName, fieldValues, conditions = null) {
  const where = conditions ? `
WHERE ${_.map(conditions, (constraint, field) => `${field} ${constraint}`).join(' AND ')};` : ';';
  return `\
UPDATE ${tableName}
SET ${_.map(fieldValues, (value, field) => `${field} = ${value}`).join(', ')}${where}
`;
};

exports.wrapCommandsNoTransaction = function wrapCommandsNoTransaction(queryInterface, commands) {
  return queryInterface.sequelize.query(`${commands.join('\n')};`);
};

exports.wrapCommands = function wrapCommands(queryInterface, commands) {
  return queryInterface.sequelize.transaction(
    transaction => queryInterface.sequelize.query(`${commands.join('\n')};`, { transaction })
  );
};

exports.conditionallyMigrateEnum = function conditionallyMigrateEnum(tableName, baseCol, targetCol, baseEnum, targetEnum,
  { joinedTable = null, joinStatement = null } = {}, instructions) {
  if (joinedTable && !joinStatement) throw new Error('Should explain joinStatement for joining tables');

  const begin = `UPDATE "${tableName}"\n  SET ${targetCol} = (CASE\n`;

  const updates = instructions.map((args) => {
    if (!Array.isArray(args)) throw new Error(`The instruction set of arguments "${args}" is not valid`);
    switch (args.length) {
      case 2:
        return `    WHEN "${tableName}".${baseCol}='${args[0]}'::${baseEnum}
                      THEN '${args[1]}'::${targetEnum}`;
      case 3:
        return `    WHEN ("${tableName}".${baseCol}='${args[0]}'::${baseEnum}
                      AND "${joinedTable || tableName}".${args[2]})
                      THEN '${args[1]}'::${targetEnum}`;
      default:
        throw new Error(`Each instruction set should contain 1, 2 or 3 arguments. Got "${args}"`);
    }
  });

  const end = `\n    ELSE "${tableName}".${targetCol}\nEND) ${joinStatement || ''};\n`;

  return begin + updates.join('\n') + end;
};

exports.renameJsonbKey = function renameJsonbKey(tableName, columnName, oldKey, newKey) {
  return `\
UPDATE ${tableName}
SET ${columnName} = ${columnName} - '${oldKey}' || jsonb_build_object('${newKey}', ${columnName}->'${oldKey}')
WHERE ${columnName} ? '${oldKey}';
`;
};
