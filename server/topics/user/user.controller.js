import { validation } from 'server/helpers/helpers';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export class UserController {
  @validation({
    body: {},
    params: {},
    query: {}
  })
  async get(req, res) {
    const users = {};
    res.json({ users });
  }
}
