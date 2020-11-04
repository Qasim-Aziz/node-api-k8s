import config from 'src/config';
import { Env } from 'src/server/helpers';
import { HOUR } from 'src/server/constants';
import cookie from 'cookie';

const SessionConfig = config.get('session');

export class CookiesManager {
  static setCookies(res, token) {
    const maxAge = SessionConfig.ttl * HOUR;
    const defaultOptions = { maxAge, secure: Env.isProd };
    res.cookie(SessionConfig.tokenCookieName, token, defaultOptions);
  }

  static clearCookies(res) {
    res.clearCookie(SessionConfig.tokenCookieName);
  }

  static extractCookies(res) {
    const [cookiesString] = res.headers['set-cookie'];
    return cookie.parse(cookiesString);
  }
}
