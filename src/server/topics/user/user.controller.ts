import { validation, Joi, Auth } from 'src/server/helpers';
import UserService from 'src/server/topics/user/user.service';

export class UserController {
  @validation({
    query: { email: Joi.string().lowercase().email().required() },
  })
  @Auth.forAll()
  static async getByEmail(req, res) {
    const { query: { email }, transaction } = req;
    const emailUsed = await UserService.checkEmailExist(email, { transaction });
    res.json({ emailUsed });
  }

  @validation({
    query: { pseudo: Joi.string().lowercase().required() },
  })
  @Auth.forAll()
  static async getByPseudo(req, res) {
    const { query: { pseudo }, transaction } = req;
    const pseudoUsed = await UserService.checkPseudoExist(pseudo, { transaction });
    res.json({ pseudoUsed });
  }
}
