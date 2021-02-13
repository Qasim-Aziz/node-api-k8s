import { validation, Joi, Auth } from 'src/server/helpers';
import { TropheeCode } from 'src/server/constants';
import { TropheeService } from 'src/server/topics/trophee/trophee.service';

export class TropheeController {
  @validation({
    body: {
      messageId: Joi.number().required(),
      tropheeCode: Joi.any().valid(...Object.values(TropheeCode)).required(),
    },
  })
  @Auth.forLogged()
  static async setTrophee(req, { transaction = null } = {}) {
    const { body: { messageId, tropheeCode }, user: { id: reqUserId } } = req;
    const message = await TropheeService.setTrophee(reqUserId, messageId, tropheeCode, { transaction });
    return { message };
  }
}
