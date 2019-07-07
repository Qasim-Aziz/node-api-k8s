// eslint-disable-next-line import/no-extraneous-dependencies
import glob from 'glob';

const globProm = Promise.promisify(glob);
export default globProm;
