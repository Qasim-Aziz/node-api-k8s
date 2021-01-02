import migrate from 'migrate';
import config from 'src/config';
import { sequelize } from 'src/orm/database';
import { logger } from 'src/server/helpers';

export async function runMigrations({ transaction = null } = {}) {
  if (!config.get('migrate.forceUniqueTransaction')) {
    throw new Error('should always launch with config.force_unique_transaction enabled');
  }
  let transact;
  if (transaction) {
    transact = async (cb) => cb(transaction);
  } else {
    transact = sequelize.transaction.bind(sequelize);
  }
  await transact(async (trans) => {
    // load migrations
    const set: any = await new Promise((resolve, reject) => migrate.load({
      // set: A set instance if you created your own
      ignoreMissing: true,
      stateStore: {
        load(fn) {
          sequelize.query('CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name varchar(255) PRIMARY KEY);', { transaction: trans })
            .then(() => sequelize.query('LOCK TABLE "SequelizeMeta" IN ACCESS EXCLUSIVE MODE;', { transaction: trans }))
            .then(() => logger.info('Acquired lock on table SequelizeMeta in access exclusive mode'))
            .then(() => sequelize.query('ALTER TABLE "SequelizeMeta" ADD COLUMN IF NOT EXISTS "timestamp" timestamp with time zone;',
              { transaction: trans }))
            .then(() => sequelize.query('SELECT * FROM "SequelizeMeta";', { transaction: trans }))
            .then(([results]) => {
              const now = Date.now();
              const migrations = results.map((result: any) => ({
                title: result.name,
                timestamp: result.timestamp || now,
              }));
              const list = {
                lastRun: migrations.sort(
                  (a, b) => ((a.timestamp < b.timestamp || a.title < b.title) ? 1 : -1),
                )[0],
                migrations,
              };
              fn(null, list);
            })
            .catch((err) => {
              fn(err);
            });
        },
        save(list, fn) {
          const migrations = list.migrations.filter((mig) => !!mig.timestamp);
          // for (const migration of migrations) {
          //   migration.title;
          //   migration.timestamp;
          // }
          sequelize.query(
            `INSERT INTO "SequelizeMeta" VALUES ${migrations.map(
              (m, index) => `($${index * 2 + 1}, $${index * 2 + 2})`,
            ).join(',')} ON CONFLICT DO NOTHING;`,
            {
              bind: migrations.reduce(
                (a, m) => a.concat([m.title, new Date(m.timestamp)]), [],
              ),
              transaction: trans,
            },
          )
            .then(() => fn())
            .catch(fn);
        },
      },
      migrationsDirectory: 'src/migrations',
      filterFunction: (str) => str.endsWith('.ts'),
    }, (err, res) => (err ? reject(err) : resolve(res))));

    set.on('migration', (migration, direction) => {
      logger.info(`migration going ${direction} : ${migration.title}`);
    });

    await new Promise((resolve, reject) => {
      set.up((err) => {
        if (err) {
          return reject(err);
        }
        logger.info('migrations successfully ran');
        return resolve();
      });
    });
  });
}
