import { logger, moment } from 'src/server/helpers';
import { initDataConf, password } from 'src/init-data/init-data.data';
import { Message, Love, View } from 'src/orm';
import { Checks } from 'src/server/tests/tester.base';
import { AuthService } from 'src/server/topics/auth/auth.service';
import { MessageService } from 'src/server/topics/message/message.service';

const getUserByPseudo = (pseudo, users) => users.find((u) => u.pseudo === pseudo);

const createLoves = async (message, lovers, { transaction = null } = {}) => {
  const loveBulkData = lovers.map((lover) => ({ messageId: message.id, userId: lover.id, lovedAt: moment().toISOString() }));
  await Love.bulkCreate(loveBulkData, { transaction });
};

const createViews = async (message, viewers, { transaction = null } = {}) => {
  const viewBulkData = viewers.map((viewer) => ({ messageId: message.id, userId: viewer.id, viewedAt: moment().toISOString() }));
  await View.bulkCreate(viewBulkData, { transaction });
};

const createMessage = async (pseudo, messageData, users, { transaction = null } = {}) => {
  const user = getUserByPseudo(pseudo, users);
  const message = await MessageService.create({ ...messageData.apiData, userId: user.id }, { transaction });
  await Message.update({ publisedAt: messageData.otherData.publishedAt }, { where: { id: message.id }, transaction });
  if (messageData.otherData && messageData.otherData.lovedBy && messageData.otherData.lovedBy.length) {
    const lovers = messageData.otherData.lovedBy.map((loverPseudo) => getUserByPseudo(loverPseudo, users));
    await createLoves(message, lovers, { transaction });
  }
  if (messageData.otherData && messageData.otherData.lovedBy && messageData.otherData.viewedBy.length) {
    const viewers = messageData.otherData.viewedBy.map((viewerPseudo) => getUserByPseudo(viewerPseudo, users));
    await createViews(message, viewers, { transaction });
  }
};

const createMessages = async (pseudo, messages, users, { transaction = null } = {}) => {
  logger.info(`Creating messages for user ${pseudo}`);
  await Promise.all(messages.map((messageData) => createMessage(pseudo, messageData, users, { transaction })));
};

export const populateInitData = async ({ transaction = null } = {}) => {
  Checks.deactivate();
  logger.info('Creating users');
  const users = (await Promise.all(Object.keys(initDataConf).map((pseudo) => AuthService.register({
    pseudo,
    password,
    email: `${pseudo}@yopmail.com`,
  }, { transaction })))).map((userRes) => userRes.user);
  logger.info('Creating messages');
  await Promise.all(Object.entries(initDataConf)
    .map(async ([pseudo, userData]) => {
      if (userData.messages && userData.messages.length) return createMessages(pseudo, userData.messages, users, { transaction });
      return null;
    }));
  Checks.reactivate();
};
