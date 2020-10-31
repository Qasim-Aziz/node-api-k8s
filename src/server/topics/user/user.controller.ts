import { validation } from 'src/server/helpers';
import { User } from 'src/orm';
import { Joi } from 'src/server/helpers';

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
