import {
  logger, moment, PromiseUtils, transactionContext,
} from 'src/server/helpers';
import { initDataConf, password } from 'src/init-data/init-data.data';
import { Message, Love, View } from 'src/orm';
import { Checks } from 'src/server/tests/tester.base';
import { AuthService } from 'src/server/topics/auth/auth.service';
import { MessageService } from 'src/server/topics/message/message.service';
import CommentService from 'src/server/topics/comment/comment.service';

let users;
const getUserByPseudo = (pseudo) => users.find((u) => u.pseudo === pseudo);

const createLoves = async (message, lovers, { transaction = null } = {}) => {
  const loveBulkData = lovers.map((lover) => ({ messageId: message.id, userId: lover.id, lovedAt: moment().toISOString() }));
  await Love.bulkCreate(loveBulkData, { transaction });
};

const createViews = async (message, viewers, { transaction = null } = {}) => {
  const viewBulkData = viewers.map((viewer) => ({ messageId: message.id, userId: viewer.id, viewedAt: moment().toISOString() }));
  await View.bulkCreate(viewBulkData, { transaction });
};

const createComments = async (message, comments, { transaction = null } = {}) => {
  await PromiseUtils.promiseMapSeries(comments, async ({ commentedBy, content, lovedBy }) => {
    const comment = await CommentService.addComment({
      messageId: message.id,
      content,
      userId: getUserByPseudo(commentedBy).id,
    }, { transaction });
    await PromiseUtils.promiseMapSeries(lovedBy,
      (pseudo) => CommentService.loveComment(comment.id, getUserByPseudo(pseudo).id, { transaction }));
  });
};

const createMessage = async (pseudo, messageData, { transaction = null } = {}) => {
  const user = getUserByPseudo(pseudo);
  const message = await MessageService.create({ ...messageData.apiData, userId: user.id }, { transaction });
  await Message.update({ publisedAt: messageData.otherData.publishedAt }, { where: { id: message.id }, transaction });
  if (messageData.otherData && messageData.otherData.lovedBy && messageData.otherData.lovedBy.length) {
    const lovers = messageData.otherData.lovedBy.map((loverPseudo) => getUserByPseudo(loverPseudo));
    await createLoves(message, lovers, { transaction });
  }
  if (messageData.otherData && messageData.otherData.lovedBy && messageData.otherData.viewedBy.length) {
    const viewers = messageData.otherData.viewedBy.map((viewerPseudo) => getUserByPseudo(viewerPseudo));
    await createViews(message, viewers, { transaction });
  }
  if (messageData.otherData?.comments?.length) {
    await createComments(message, messageData.otherData?.comments, { transaction });
  }
};

const createMessages = async (pseudo, messages) => {
  logger.info(`Creating messages for user ${pseudo}`);
  await Promise.all(messages.map((messageData) =>
    transactionContext((transaction) => createMessage(pseudo, messageData, { transaction }))));
};

export const populateInitData = async () => {
  Checks.deactivate();
  logger.info('Creating users');
  users = (await Promise.all(Object.keys(initDataConf).map((pseudo) => AuthService.register({
    pseudo,
    password,
    email: `${pseudo}@yopmail.com`,
  })))).map(({ user, token }) => Object.assign(user, { token }));
  logger.info('Creating messages');
  await Promise.all(Object.entries(initDataConf)
    .map(async ([pseudo, userData]) => {
      if (userData.messages && userData.messages.length) {
        return createMessages(pseudo, userData.messages);
      }
      return null;
    }));
  Checks.reactivate();
};
