import { TransactionContextManager, BackError, logger } from 'src/server/helpers';

export class Checks {
  static counter;

  static deactivate() {
    Checks.counter = Checks.counter || 0;
    Checks.counter += 1;
    TransactionContextManager.deactivate();
  }

  static reactivate() {
    if (!Checks.counter) throw new BackError('Reactivate is used before Deactivate');
    Checks.counter -= 1;
    if (Checks.counter < 0) throw new BackError('Checks counter should never be negative');
    if (Checks.counter === 0) {
      TransactionContextManager.reactivate();
    }
  }

  static assertIsActivated() {
    if (TransactionContextManager.isActivatedFlag) return;
    throw new BackError('Checks are deactivated');
  }
}

export const checkExpectedStatus = (status) => ((res) => {
  if (status !== res.status) {
    const msg = `Expected status ${status}, got ${res.status}.
        Method: ${res.req.method}
        Path: ${res.req.path}
        Body: {
          name: ${res.body.name}
          msg: ${res.body.message}
          stack: ${res.body.stack}
        }`;
    const stackContainer = {};
    Error.captureStackTrace(stackContainer, checkExpectedStatus);
    throw new BackError(msg, res.status, stackContainer);
  }
});

export const getNumberRetriesSetUp = () => {
  if (process.env.NO_RETRIES_SET_UP !== undefined) return 0;
  return 2;
};

export const setUp = (block, timeout = 200000, message = 'should set up the test') => {
  test(message, async () => {
    const blockRecursive = async (numberOfRetriesLeft, firstError = null) => {
      try {
        await block();
      } catch (e) {
        if (e?.matcherResult?.pass === false || numberOfRetriesLeft === 0) throw firstError || e;
        logger.error(e);
        const msg = `
            ${e.name} in test setUp
            --------------------------------------------------------------
            ---------  Now retrying test setUp. retries left: ${numberOfRetriesLeft}  ---------
            --------------------------------------------------------------
          `;
        console.log(msg); // eslint-disable-line no-console
        Checks.counter = 0;
        await blockRecursive(numberOfRetriesLeft - 1, firstError || e);
      }
    };
    await blockRecursive(getNumberRetriesSetUp());
    Checks.assertIsActivated();
  }, timeout * (getNumberRetriesSetUp() + 1));
};
