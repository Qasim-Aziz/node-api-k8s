import { MessageService } from 'src/server/topics/message/message.service';
import { Trophee, User } from 'src/orm';
import { TropheeScore } from 'src/server/constants';
import { BackError } from 'src/server/helpers';
import httpStatus from 'http-status';

export class TropheeService {
  static async setTrophee(reqUserId, messageId, tropheeCode, { transaction = null } = {}) {
    console.log('reqUserId : ', reqUserId)
    const currentUserTrophee = await Trophee.findOne({
      where: { userId: reqUserId, messageId },
      transaction,
    });
    console.log('currentUserTrophee : ', currentUserTrophee)
    const connectedUser = await User.findByPk(reqUserId, { transaction });
    let { remainingScore } = connectedUser;
    if (currentUserTrophee) {
      console.log('in  currentUserTrophee: ')
      remainingScore = connectedUser.remainingScore + TropheeScore[currentUserTrophee.tropheeCode];
      await User.update({
        remainingScore,
      }, { where: {}, transaction });
      await currentUserTrophee.destroy({ transaction });
    }
    console.log('before : ')
    if (remainingScore < TropheeScore[tropheeCode]) throw new BackError('Not enough remaining score', httpStatus.BAD_REQUEST);
    console.log('after : ')
    await Trophee.create({ messageId, tropheeCode, userId: reqUserId }, { transaction });
    return MessageService.get(messageId, { transaction, reqUserId });
  }
}
