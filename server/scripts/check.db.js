import dbCheck from 'server/scripts/check.db.lib';

describe('# Checks the db', () => {
  it('should check that the DB state is good', dbCheck).timeout(60000);
});
