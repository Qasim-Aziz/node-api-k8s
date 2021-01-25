import {
  validation, Auth, Env, BackError,
} from 'src/server/helpers';
import { InitDBService } from 'src/initdb/initdb.service';
import { runMigrations } from 'src/migrations/lib/migrate-runner';
import { populateInitData } from 'src/init-data/init-data.utils';

export class InitDataController {
  @validation({})
  @Auth.forLogged()
  static async initData(req) {
    if (Env.isProd) throw new BackError('Cannot perform init in prod env !');
    await InitDBService.initDb();
    await runMigrations();
    await populateInitData();
    return { status: 'ok' };
  }
}
