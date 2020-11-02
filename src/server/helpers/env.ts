import { ENVS } from 'src/server/constants';
import config from 'src/config';

export class Env {
  static get current() {
    return config.get('app.env');
  }

  static get isTest() {
    return ENVS.TEST === Env.current;
  }

  static get isProd() {
    return ENVS.PROD === Env.current;
  }
}
