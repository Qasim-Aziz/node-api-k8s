import { DataTypes } from 'sequelize';
import { makeOneToMany, OrmModel, sequelize } from 'src/orm/database';
import { Tag } from 'src/orm/tag';

export class Trait extends OrmModel {
  public name!: string;

  public tags!: Tag[];
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
  modelName: 'trait',
});

makeOneToMany(Trait, Tag, 'traitId', false);
