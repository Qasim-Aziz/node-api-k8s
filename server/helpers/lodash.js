import lodash from 'lodash'; // eslint-disable-line no-restricted-imports
import seedrandom from 'seedrandom';

seedrandom('jardinsecret', { global: true });
const _ = lodash.runInContext();

const hasNested = (obj, key) => {
  if (!_.isObject(obj)) return false;

  if (_.has(obj, key)) return true;
  return _.some(_.map(_.values(obj), e => hasNested(e, key)));
};

export default _.assign(_, { hasNested });
