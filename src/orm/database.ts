import {
  Model, Sequelize, Op, DataTypes, QueryTypes,
} from 'sequelize';
import config from 'src/config';
import { logger } from 'src/server/helpers/logger';
import { Utils } from 'src/server/helpers/utils';
import { moment } from 'src/server/helpers/moment';

const {
  username, password, database, host, port,
} = config.get('db');
const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}`;

export const sequelize = new Sequelize(databaseUrl, {
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    freezeTableName: true,
    underscored: true,
  },
  logging: config.get('app.flags.showSql') ? logger.debug : null,
  pool: {
    max: 15,
    min: 0,
    idle: 1000,
  },
});

export class OrmModel extends Model {
  public readonly id!: number;

  public readonly createdAt!: moment.Moment;

  public readonly updatedAt!: moment.Moment;

  public readonly deletedAt!: moment.Moment;
}

export const makeforeignKey = (name, { allowNull = true } = {}) => ({
  name,
  allowNull,
  field: Utils.snakeCase(name),
});

export const makeOneToMany = (modelOne: typeof OrmModel, modelMany: typeof OrmModel, fkName, allowNull = true, as = null) => {
  const foreignKey = makeforeignKey(fkName, { allowNull });
  modelMany.belongsTo(modelOne, {
    foreignKey,
    onUpdate: 'cascade',
    onDelete: 'cascade',
    ...as ? { as } : {},
  });
  modelOne.hasMany(modelMany, { foreignKey, ...as ? { as } : {} });
};

export const makeOneToOne = (modelPointed: typeof OrmModel, modelPointer: typeof OrmModel, fkName, allowNull, as = null) => {
  const foreignKey = makeforeignKey(fkName, { allowNull });
  modelPointer.belongsTo(modelPointed, {
    foreignKey,
    onUpdate: 'cascade',
    onDelete: 'cascade',
    ...as ? { as } : {},
  });
  modelPointed.hasOne(modelPointer, {
    foreignKey,
    ...(as && modelPointed !== modelPointer) ? { as } : {},
  });
};

export {
  Op,
  DataTypes,
  Sequelize,
  QueryTypes,
};
