/**
 *
 * NEVER EXPORT THIS FILE TO TEST UTILS !!!
 *    test.utils is supposed to export all testers,
 *    while tester.helpers provides helpers for testers,
 *    hence explicitly exporting this file in test.utils introduces
 *    circular imports that are hard to bug-track later...
 *
 */
import fs from 'fs';
import { AssertionError } from 'chai';
import _ from 'server/helpers/lodash';
import moment from 'server/helpers/moment';
import expect from 'server/helpers/test.framework';
import { TransactionContextManager } from 'server/helpers/transaction';
import { SpyAndStubManager } from 'server/helpers/sinon.infra';
import { TestError } from 'server/helpers/errors';
import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars

export class Checks {
  static deactivate() {
    Checks.counter = Checks.counter || 0;
    Checks.counter += 1;
    SpyAndStubManager.deactivate();
    TransactionContextManager.deactivate();
  }

  static reactivate() {
    if (_.isNil(Checks.counter)) throw TestError('Reactivate is used before Deactivate');
    Checks.counter -= 1;
    if (Checks.counter < 0) throw TestError('Checks counter should never be negative');
    if (Checks.counter === 0) {
      SpyAndStubManager.reactivate();
      TransactionContextManager.reactivate();
    }
  }

  static assertIsActivated() {
    if (SpyAndStubManager.isActivated && TransactionContextManager.isActivated) return;
    throw new TestError('Checks are deactivated');
  }
}

export const setUp = (block, timeout = 20000, message = 'should set up the test') => {
  it(message, async () => {
    const blockRecursive = async (numberOfRetriesLeft, firstError) => {
      try {
        await block();
      } catch (e) {
        if (e instanceof AssertionError || numberOfRetriesLeft === 0) throw firstError || e;
        logger.error(e);
        console.log(`\n${e.name} in test setUp`); // eslint-disable-line no-console
        console.log('\n--------------------------------------------------------------'); // eslint-disable-line no-console
        console.log(`---------  Now retrying test setUp. retries left: ${numberOfRetriesLeft}  ---------`); // eslint-disable-line no-console
        console.log('--------------------------------------------------------------\n'); // eslint-disable-line no-console
        Checks.counter = 0;
        await blockRecursive(numberOfRetriesLeft - 1, firstError || e);
      }
    };
    await blockRecursive(getNumberRetriesSetUp());
    Checks.assertIsActivated();
  }).timeout(timeout * getNumberRetriesSetUp());
};

export const getNumberRetriesSetUp = () => {
  if (process.env.NO_RETRIES_SET_UP !== undefined) return 0;
  return 2;
};

export const newDate = (day, hour, minute, { month = 10, year = 2016, second = 0, millisecond = 0 } = {}) =>
  moment({ year, month, day, hour, minute, second, millisecond }).toISOString();

export const newMomentDateOnly = (day, hours, minutes, { month = 10, year = 2016 } = {}) =>
  moment().set('year', year)
    .set('month', month - 1)
    .set('date', 1)
    .add(day, 'days')
    .add(hours, 'hours')
    .add(minutes, 'minutes')
    .format('YYYY-MM-DD');

export const listEquals = (l, lExpected, { wrongNumberErrorMessage } = {}) => {
  expect(l.length).to.equal(lExpected.length, wrongNumberErrorMessage);
  expect(l).to.deep.include.members(lExpected);
};

export const listEqualsStrict = (l, lExpected, { wrongNumberErrorMessage } = {}) => {
  expect(l.length).to.equal(lExpected.length, wrongNumberErrorMessage);
  expect(l).to.deep.equal(lExpected);
};

const statAsync = Promise.promisify(fs.stat);

export const getFileSize = async (filePath) => {
  const stats = await statAsync(filePath);
  return stats.size;
};

export const checkFileLength = async (res, filePath) => {
  const contentLength = parseInt(res.header['content-length'], 10);
  const fileSize = await getFileSize(filePath);
  expect(contentLength).to.equal(fileSize);
  expect(res.body.length).to.equal(fileSize);
};

export const compareDate = (d, dExpected, errorMessage = '') => {
  const same = moment(d).isSame(moment(dExpected));
  expect(same).to.be.true(errorMessage);
};

export const compareDateOrNull = (d, dExpected, errorMsg = '') => {
  if (_.isNull(dExpected)) {
    expect(d).to.be.null(errorMsg);
  } else {
    compareDate(d, dExpected, errorMsg);
  }
};

/** Error diff handling for testing and logging form differences between CSV files and forms in the DB */

// format the logged difference
const _formatType = element => `type: ${(typeof element)}${'          '}`.substring(0, 15);

// _areDifferent handles differences for simple elements or for lists
const _areDifferent = (a, b) =>
  ((Array.isArray(a) && Array.isArray(b)) ?
    _.includes(_.map(_.zip(a, b), ([_a, _b]) => (_a !== _b)), true) :
    (a !== b));

const _showDiff = (key, actual, expected) => {
  // Receive non-object simple elements
  if (_areDifferent(actual, expected)) {
    return `    On key="${key}$", got:
      |Actual:   [${_formatType(actual)}][${actual}]
      |Expected: [${_formatType(expected)}][${expected}]`;
  }
  return '';
};

const _pushDiff = (key, _a, _e, diffs) => {
  // If differences are captured, pushed them to a list of diffs
  const _diff = _showDiff(key, _a[key], _e[key]);
  if (_diff !== '') diffs.push(_diff);
};

const _showDiffErrorObjects = (err) => {
  // Receive err with objects to be compared
  const actual = err.actual;
  const expected = err.expected;
  const diffToShow = [];

  if ((typeof actual) === 'object') {
    _.forOwn(actual, (value, key) => {
      _pushDiff(key, actual, expected, diffToShow);
    });

    _.forOwn(expected, (value, key) => {
      if (!_.has(actual, key)) _pushDiff(key, actual, expected, diffToShow);
    });
  } else {
    diffToShow.push(_showDiff('', actual, expected));
  }

  return diffToShow.join('\n');
};

export const expectOrDump = (messagePrefix, expectCallback) => {
  // Call the expectCallback and if expectation fails then log the difference smartly
  try {
    expectCallback();
  } catch (err) {
    if (process.env.NO_FAIL !== undefined) {
      // eslint-disable-next-line no-console
      console.log(`  DB::${messagePrefix}\n${_showDiffErrorObjects(err)}`);
    } else {
      throw err;
    }
  }
};

export const checkUnauthorized = (res) => {
  expect(res.body.message).to.eq('Format is Authorization: Bearer [token]');
};

export const buildFilePath = (filename, subdir = '') => `${directoryImg}/${subdir}${filename}`;

/** *********************************
 * Files utils *
 ***********************************/

export const compareAllFilesAndAddIds = (filesReceived, filesExpected,
  { customFileName = null, urlResolver = file => `/api/files/${file.id}/download` } = {}) => {
  const sortFiles = files => _.sortBy(files, ['filename', 'id']);
  const sortedFilesReceived = sortFiles(filesReceived);
  const sortedFilesExpected = sortFiles(filesExpected);
  expect(sortedFilesReceived.length).to.equal(sortedFilesExpected.length, 'wrong number of files');
  _.each(_.zip(sortedFilesReceived, sortedFilesExpected), ([fileReceived, fileExpected]) => {
    expect(fileReceived.id).to.exist();
    if (fileExpected.id) {
      expect(fileReceived.id).to.equal(fileExpected.id);
    } else {
      fileExpected.id = fileReceived.id; // eslint-disable-line no-param-reassign
    }

    if (fileExpected.fileMetaId) {
      expect(fileReceived.fileMetaId).to.equal(fileExpected.fileMetaId);
    } else {
      fileExpected.fileMetaId = fileReceived.fileMetaId; // eslint-disable-line no-param-reassign
    }
    expect(fileReceived.url).to.equal(urlResolver(fileReceived));

    if (customFileName) {
      expect(fileReceived.filename).to.equal(customFileName);
    } else {
      expect(fileReceived.filename).to.equal(fileExpected.filename);
    }
  });
};

export const addFilesInReqAndObject = (newFiles, req, { filesFieldName = 'files', objectExpected = null, filesToDelete = null } = {}) => {
  _.map(newFiles, file => req.attach(filesFieldName, buildFilePath(file.filename)));
  if (objectExpected) {
    objectExpected.files = _.union(objectExpected.files, newFiles); // eslint-disable-line no-param-reassign
    if (filesToDelete) {
      objectExpected.files = _.filter(objectExpected.files, f => filesToDelete.indexOf(f) < 0); // eslint-disable-line no-param-reassign
    }
  }
};

export const isRejected = async (promMaker, { errorMessage = null } = {}) => {
  Promise.onPossiblyUnhandledRejection(() => {
  });
  let error = null;
  await promMaker().catch((e) => {
    error = e;
  });
  try {
    expect(error).to.not.be.null();
  } catch (err) {
    throw new Error('Expected promise to be rejected');
  }
  if (!_.isNull(errorMessage)) {
    expect(error.message).to.equal(errorMessage);
  }
  Promise.onPossiblyUnhandledRejection((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
  return error;
};
