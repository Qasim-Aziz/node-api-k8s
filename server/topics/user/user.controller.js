import { validation } from 'server/helpers/helpers';
import { User } from 'orm';
import logger from 'server/helpers/logger';
import Joi from 'server/helpers/joi'; // eslint-disable-line no-unused-vars

export class UserController {
  @validation({
    query: { email: Joi.string().lowercase().email().required() },
  })
  async getByEmail(req, res) {
    const emailUsed = !!(await User.count({ where: { email: req.query.email } }));
    res.json({ emailUsed });
  }

  @validation({
    query: { pseudo: Joi.string().lowercase().required() },
  })
  async getByPseudo(req, res) {
    const pseudoUsed = !!(await User.count({ where: { pseudo: req.query.pseudo } }));
    res.json({ pseudoUsed });
  }
}
