import { validation, Joi, Auth } from 'src/server/helpers';
import { EMOTION_CODE, PRIVACY_LEVEL } from 'src/server/constants';
import { MessageService } from 'src/server/topics/message/message.service';

export class MessageController {
  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async get(req, res) {
    console.log('reqUserId : ', req.user.id)
    const message = await MessageService.get(req.params.messageId, { reqUserId: req.user.id });
    res.json({ message });
  }

  @validation({
    query: { userId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async getAll(req, res) {
    const messages = await MessageService.getAll(req.user.id, req.query.userId);
    res.json({ messages });
  }

  @validation({})
  @Auth.forLogged()
  static async getNext(req, res) {
    console.log('reqUserId in getNext : ', req.user.id)
    const message = await MessageService.getNext(req.user.id);
    res.json({ message });
  }

  @validation({
    query: { q: Joi.string().optional() },
  })
  @Auth.forLogged()
  static async searchTraits(req, res) {
    const traits = await MessageService.searchTraits(req.query.q);
    res.json({ traits });
  }

  @validation({
    body: {
      emotionCode: Joi.any().valid(...Object.values(EMOTION_CODE)).required(),
      privacy: Joi.any().valid(...Object.values(PRIVACY_LEVEL)).required(),
      content: Joi.string().required(),
      traitNames: Joi.array().items(Joi.string().regex(/^[A-Za-z0-9]+$/)).optional(),
      userId: Joi.number().required(),
    },
  })
  @Auth.forLogged()
  static async create(req, res) {
    const { body: messageData, transaction } = req;
    const message = await MessageService.create(messageData, { transaction });
    res.json({ message });
  }

  @validation({
    body: {
      emotionCode: Joi.any().valid(...Object.values(EMOTION_CODE)).optional(),
      privacy: Joi.any().valid(...Object.values(PRIVACY_LEVEL)).optional(),
      content: Joi.string().optional(),
      traitNames: Joi.array().items(Joi.string().regex(/^[A-Za-z0-9]+$/)).optional(),
    },
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async update(req, res) {
    const { params: { messageId }, body: messageData, transaction } = req;
    await MessageService.checkUserRight(req.user.id, messageId);
    const message = await MessageService.update(messageId, messageData, { transaction });
    res.json({ message });
  }

  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async loveOrUnlove(req, res) {
    const { params: { messageId }, user: { id: reqUserId }, transaction } = req;
    const message = await MessageService.loveOrUnlove(messageId, reqUserId, { transaction });
    res.json({ message });
  }

  @validation({
    params: { messageId: Joi.number().integer().required() },
  })
  @Auth.forLogged()
  static async delete(req, res) {
    const { params: { messageId }, user: { id: reqUserId }, transaction } = req;
    await MessageService.delete(messageId, reqUserId, { transaction });
    res.json({});
  }
}
