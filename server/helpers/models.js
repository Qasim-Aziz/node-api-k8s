import _ from 'server/helpers/lodash';
import { omitByNil } from 'server/helpers/helpers';

export const makeFK = (name, { allowNull = true } = {}) => ({ name, field: _.snakeCase(name), allowNull });
// TODO: On makeFK, many models are using it, with "as" parameter, but it seems not to be used...

export const makeOneToMany = (modelOne, modelMany, fkName, allowNull, as = null) => {
  const foreignKey = makeFK(fkName, { allowNull });
  modelMany.belongsTo(modelOne, omitByNil({
    foreignKey,
    onUpdate: 'cascade',
    onDelete: 'cascade',
    as,
  }));
  modelOne.hasMany(modelMany, omitByNil({ foreignKey, as }));
};

export const makeOneToOne = (modelPointed, modelPointer, fkName, allowNull, as = null) => {
  const foreignKey = makeFK(fkName, { allowNull });
  modelPointer.belongsTo(modelPointed, omitByNil({
    foreignKey,
    onUpdate: 'cascade',
    onDelete: 'cascade',
    as,
  }));
  modelPointed.hasOne(modelPointer, omitByNil({ foreignKey, as }));
};
