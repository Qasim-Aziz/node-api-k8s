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
  return 0;
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
        logger.error(msg); // eslint-disable-line no-console
        Checks.counter = 0;
        await blockRecursive(numberOfRetriesLeft - 1, firstError || e);
      }
    };
    await blockRecursive(getNumberRetriesSetUp());
    Checks.assertIsActivated();
  }, timeout * (getNumberRetriesSetUp() + 1));
};

/**
 * Test array containing matching objects without ordering
 * @param list
 * @param expected
 */
export const expectArrayContainingMatchingObjectsAnyOrder: any = (list: Array<Record<string, any>>, expected: Array<Record<string, any>>) => {
  expect(list).toMatchObject(expect.arrayContaining(expected.map((exp) =>
    expect.objectContaining(exp))));
};

/**
 * Test array containing primitive elements without ordering
 * @param list
 * @param expected
 */
export const expectArrayContainingAnyOrder: any = (list: Array<any>, expected: Array<any>) => {
  expect(list).toEqual(expect.arrayContaining(expected));
};

/**
 * Test equality between two 1-level-deep arrays without ordering
 * @param list
 * @param expected
 */
export const expectEqualArrayAnyOrder: any = (list: Array<any>, expected: Array<any>) => {
  expectArrayContainingAnyOrder(list, expected);
  expect(list.length).toBe(expected.length);
};

/**
 * Test deep-matching between two structures (array/object) without ordering
 * @param tested
 * @param expected
 */
export const expectDeepMatch: any = (tested: Array<any> | Record<string, any>, expected: Array<any> | Record<string, any>) => {
  let expectation = expected;
  if (Array.isArray(expected)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    expectation = expectDeepMatchingArray(expected);
  } else if (expected instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    expectation = expectDeepMatchingObject(expected);
  }
  expect(tested).toMatchObject(expectation);
};

const expectDeepMatchingArray: any = (expected: Array<any>) => expect.arrayContaining(expected.map((value) => {
  if (Array.isArray(value)) {
    return expectDeepMatchingArray(value);
  }
  if (value instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return expectDeepMatchingObject(value);
  }
  return value;
}));

const expectDeepMatchingObject: any = (expected: Record<string, any>) =>
  expect.objectContaining(Object.entries(expected).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      return { ...acc, [key]: expectDeepMatchingArray(value) };
    }
    if (value instanceof Object) {
      return { ...acc, [key]: expectDeepMatchingObject(value) };
    }
    return acc;
  }, expected));
