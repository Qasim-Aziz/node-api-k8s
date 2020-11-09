import ScriptAbstract from 'src/scripts/script-abstract';
import { runMigrations } from 'src/migrations/lib/migrate-runner';
import { logger, transactionContext } from 'src/server/helpers';
import { InitDBService } from 'src/initdb/initdb.service';
import { populateInitData } from 'src/init-data/init-data.utils';

export default class InitData extends ScriptAbstract {
  getScript = async () => {
    logger.info('Running init db');
    await InitDBService.initDb();
    logger.info('Running migrations');
    await runMigrations();
    logger.info('Populating data');
    await transactionContext((transaction) => populateInitData({ transaction }));
    logger.info('Init data successfully ran');
  };
}
