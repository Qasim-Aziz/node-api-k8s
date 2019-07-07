import { InitDBService } from 'initdb/initdb.service';
import { sequelize } from 'orm/index';
import { setUp } from 'server/helpers/tester.base';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

before('# Data Base Init Internal', () => {
  setUp(async () => {
    if (process.env.DB_SYNC !== undefined) {
      console.log('Initing DB with DB_SYNC (forcing synchronization)'); // eslint-disable-line no-console
      await sequelize.sync({ force: true });
    } else {
      await InitDBService.initDb();
    }
  }, 240000, 'should synchronize all tables');
});
