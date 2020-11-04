import { logger } from 'src/server/helpers/logger';

export class PromiseUtils {
  static promiseAll = async (promises) => (promises.length ? Promise.all(promises) : []);

  static promiseMapSeries = async (input = [], callback = (val, ind = null, inp = null) => (val)) => {
    const results = [];
    const n = input.length;
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, value] of Object.keys((input))) {
      // eslint-disable-next-line no-await-in-loop
      const result = await callback(value, index, n);
      results.push(result);
    }
    return results;
  };

  static promiseMap = async (
    input = [],
    mapper = (val, ind = null, inp = null) => (val),
    { concurrency = 15 } = {},
  ) => new Promise((resolve, reject) => {
    const len = input.length;
    let completed = 0;
    let started = 0;
    let running = 0;
    const results = new Array(input.length);
    const launchPromiseAtIndex = (index) => {
      Promise.resolve(mapper(input[index], index, input))
        .then((result) => {
          running -= 1;
          completed += 1;
          results[index] = result;
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          replenish();
        }).catch(reject);
    };
    // eslint-disable-next-line consistent-return
    const replenish = () => {
      if (completed >= len) {
        return resolve(results);
      }
      while (running < concurrency && started < len) {
        started += 1;
        running += 1;
        launchPromiseAtIndex(started - 1);
      }
    };
    replenish();
  });

  static promiseTimeout = async (promise, timeout, { error = undefined } = {}) => Promise.race(
    [
      promise,
      new Promise((res, rej) => setTimeout(() => rej(new Error(error)), timeout * 1000)),
    ],
  );

  static promiseRetry = async (block, { retries = 2, timeout = 200000 } = {}) => {
    await PromiseUtils.promiseTimeout((async () => {
      const blockRecursive = async (numberOfRetriesLeft, firstError = null) => {
        try {
          await block();
        } catch (e) {
          if (numberOfRetriesLeft === 0) throw firstError || e;
          logger.error(e);
          logger.debug(`\n${e.name} in test setUp`);
          logger.debug('\n--------------------------------------------------------------');
          logger.debug(`---------  Now retrying Promise. retries left: ${numberOfRetriesLeft}  ---------`);
          logger.debug('--------------------------------------------------------------\n');
          await blockRecursive(numberOfRetriesLeft - 1, firstError || e);
        }
      };
      await blockRecursive(retries);
    })(), timeout * retries);
  };
}
