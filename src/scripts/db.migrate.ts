import ScriptAbstract from "./script-abstract";
import {runMigrations} from "../migrations/lib/migrate-runner";

export default class DbMigrate extends ScriptAbstract{
  async getScript() {
    await runMigrations()
  }
}
