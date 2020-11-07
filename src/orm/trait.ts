import { DataTypes } from 'sequelize';
import { OrmModel, sequelize } from 'src/orm/database';

export class Trait extends OrmModel {
  public name!: string;
}

Trait.init({
  name: {
    type: DataTypes.STRING,
    field: 'name',
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'trait',
});
