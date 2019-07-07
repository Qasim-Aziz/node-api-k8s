import { InitDBService } from 'initdb/initdb.service';

import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

describe('# Data Base Migrate Internal', () => {
  it('should migrate all migrations', async () => InitDBService.migrate()).timeout(90000);
});
