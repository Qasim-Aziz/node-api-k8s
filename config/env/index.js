import path from 'path';
import _ from 'server/helpers/lodash';
import configDefault from 'config/env/default';
import configEnvs from 'config/env/envs';
import { ENVS } from 'server/constants';

const env = process.env.NODE_ENV || ENVS.LOCAL;
const config = configEnvs[env]; // eslint-disable-line import/no-dynamic-require

const defaults = {
  root: path.join(__dirname, '/..'),
  url: process.env.API_URL || 'localhost:12873'
};
export default _.merge({}, configDefault, defaults, config);
