import ScriptAbstract from 'src/scripts/script-abstract';
import { runMigrations } from 'src/migrations/lib/migrate-runner';

export default class DbMigrate extends ScriptAbstract {
  getScript = async () => {
    await runMigrations();
  };
}
