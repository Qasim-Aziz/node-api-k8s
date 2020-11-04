import { Model, Sequelize, Op } from 'sequelize';
import config from 'src/config';
import { logger } from 'src/server/helpers/logger';

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

export {
  Op,
};

export class OrmModel extends Model {
  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}
