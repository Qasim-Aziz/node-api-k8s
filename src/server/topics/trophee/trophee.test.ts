import httpStatus from 'http-status';
import { Checks, setUp } from 'src/server/tests/tester.base';
import { InitDBService } from 'src/initdb/initdb.service';
import * as Testers from 'src/server/tests/testers';
import {
  EmotionCode, GenderType, PrivacyLevel, TropheeCode,
} from 'src/server/constants';
import { User } from 'src/orm';

const user1: any = {
  email: 'user1@yopmail.com', pseudo: 'user1', password: 'pwd', gender: GenderType.MALE,
};
const user2: any = {
  email: 'user2@yopmail.com', pseudo: 'user2', password: 'pwd', gender: GenderType.MALE,
};
const user3: any = {
  email: 'user3@yopmail.com', pseudo: 'user3', password: 'pwd', gender: GenderType.MALE,
};
const message1: any = {
  content: 'message 1 content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.APAISE,
};
const message2: any = {
  content: 'message 2 content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.NERVEUX, traitNames: ['anxiete'],
};
const message3: any = {
  content: 'message 3 content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.NERVEUX, traitNames: ['anxiete'],
};
const message4: any = {
  content: 'message 4 content', privacy: PrivacyLevel.PUBLIC, emotionCode: EmotionCode.NERVEUX, traitNames: ['anxiete'],
};

describe('# Trophee Tests', () => {
  setUp(async () => {
    await InitDBService.truncateTables();
    Checks.deactivate();
    await Promise.all([user1, user2, user3].map((p) => Testers.registerUser(p)));
    Checks.reactivate();
    await Testers.publishMessage(user1, message1);
    await Testers.publishMessage(user2, message2);
    await Testers.publishMessage(user3, message3);
    await Testers.publishMessage(user1, message4);
    await User.update({ remainingScore: 100 }, { where: { id: [user2.id, user3.id] } });
  });

  test('shoud not set a trophee to a message if not enough remaining score', () => Testers.setTrophee(
    user1, message2.id, TropheeCode.BADGE_9, { status: httpStatus.BAD_REQUEST },
  ));

  test('shoud set a trophee to a message and get the right stats', () => Testers.setTrophee(
    user2, message1.id, TropheeCode.BADGE_1, {
      expectedUserTrophee: TropheeCode.BADGE_1,
      expectedMessageTrophees: {
        [TropheeCode.BADGE_1]: 1,
      },
    },
  ));

  test('shoud set another trophee to a message and get the right stats', () => Testers.setTrophee(
    user2, message1.id, TropheeCode.BADGE_2, {
      expectedUserTrophee: TropheeCode.BADGE_2,
      expectedMessageTrophees: {
        [TropheeCode.BADGE_2]: 1,
      },
    },
  ));

  test('shoud set a trophee to a message by another user and get the right stats', () => Testers.setTrophee(
    user3, message1.id, TropheeCode.BADGE_1, {
      expectedUserTrophee: TropheeCode.BADGE_1,
      expectedMessageTrophees: {
        [TropheeCode.BADGE_2]: 1,
        [TropheeCode.BADGE_1]: 1,
      },
    },
  ));

  test('shoud set a trophee to a message by another user and get the right stats bis', () => Testers.setTrophee(
    user2, message4.id, TropheeCode.BADGE_3, {
      expectedUserTrophee: TropheeCode.BADGE_3,
      expectedMessageTrophees: {
        [TropheeCode.BADGE_3]: 1,
      },
    },
  ));

  test('shoud get the right trophees stats for user', () => Testers.getUser(user2, user1.id, {
    expectedUser: {
      tropheesStats: {
        [TropheeCode.BADGE_2]: 1,
        [TropheeCode.BADGE_1]: 1,
        [TropheeCode.BADGE_3]: 1,
      },
      nbTrophees: 3,
    },
  }));
});
