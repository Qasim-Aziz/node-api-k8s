import { logger } from 'src/server/helpers';

export default abstract class ScriptAbstract {
  abstract async getScript();

  async exec() {
    try {
      await this.getScript();
      process.exit(0);
    } catch (e) {
      logger.error(e);
      process.exit(1);
    }
  }
}
