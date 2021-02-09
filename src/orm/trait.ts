import { DataTypes } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { Tag } from 'src/orm/tag';

export class Trait extends OrmModel {
  public name!: string;

  public tags!: Tag[];

  public position!: number;
}

Trait.init({
  name: {
    type: DataTypes.STRING,
    field: 'name',
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
    field: 'position',
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'trait',
  modelName: 'trait',
});

makeOneToMany(Trait, Tag, 'traitId', false);
