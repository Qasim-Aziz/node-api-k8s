import ScriptAbstract from 'src/scripts/script-abstract';
import { logger, PromiseUtils } from 'src/server/helpers';
import { InitDBService } from 'src/initdb/initdb.service';

export default class DbInit extends ScriptAbstract {
  getScript= () => PromiseUtils.promiseRetry(async () => {
    logger.info('Database init internal');
    await InitDBService.initDb();
  }, { timeout: 240 });
}
