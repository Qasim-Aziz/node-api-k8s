import fs from 'fs';
import stream from 'stream';
import tmp from 'tmp';
import multer from 'multer';
import httpStatus from 'http-status';
import _ from 'server/helpers/lodash';
import Joi from 'server/helpers/joi';
import config from 'config/env';
import moment from 'server/helpers/moment';
import { ENVS } from 'server/constants';
import BackError from 'server/helpers/back.error';
import logger from 'server/helpers/logger'; // eslint-disable-line no-unused-vars


// One may want to cleanup the temporary files even when an uncaught exception occurs
tmp.setGracefulCleanup();

global.Promise = require('bluebird');

Promise.promisifyAll(fs); // eslint-disable-line no-unused-vars

export const getObjectOrError = async (model, id, {
  error = new BackError(`getObjectOrError default Error: with table ${model.getTableName()} and id ${id}`),
  attributes = undefined, include = undefined, where = undefined, transaction = null, scope = null
} = {}) => {
  const rvModel = _.isNil(scope) ? model : model.scope(scope);
  const rv = await rvModel.findById(id, reformatOpts(omitByNil({ attributes, include, where, transaction })));
  if (rv === null) throw error;
  return rv;
};

export const getObjectOr404 = async (model, id, { attributes = undefined, include = undefined, where = undefined, transaction = null } = {}) =>
  getObjectOrError(model, id, {
    error: new BackError(`${model.getTableName()} ${id} not found`, httpStatus.NOT_FOUND),
    attributes,
    include,
    where,
    transaction
  });

export const getOneOrError = async (model, opts, {
  tooManyError = new BackError(`Multiple ${model.getTableName()} found with opts ${JSON.stringify(_.keys(opts))}`),
  notFoundError = new BackError(`${model.getTableName()} not found with opts ${JSON.stringify(_.keys(opts))}`, httpStatus.NOT_FOUND),
  transaction = null
} = {}) => {
  const [rv, rvUnexpected] = await model.findAll({ ...reformatOpts(omitByNil(opts)), transaction });
  if (!_.isUndefined(rvUnexpected)) throw tooManyError;
  if (_.isUndefined(rv)) throw notFoundError;
  return rv;
};

export const plain = e => e && e.get({ plain: true });

export const omitValue = (l, label) => _.filter(l, e => e !== label);

export const omitByNil = o => _.omitBy(o, _.isNil);

export const mapToId = (array, idKey = 'id') => _.map(array, idKey);

export const mapToMtmId = array => mapToId(array, 'medicalTeamMembershipId');

export const mapToSectorId = array => mapToId(array, 'sectorId');

export const mapPlain = l => l.map(plain);

export const mapPick = (sequelizeArray, fields) => _.map(sequelizeArray, element => _.pick(element, fields));

export const mapOmit = (array, fields) => _.map(array, element => _.omit(element, fields));

export const mergeByKey = (arr1, arr2, key) => _.values(_.merge(_.keyBy(arr1, key), _.keyBy(arr2, key)));

export function isInt(value) {
  if (isNaN(value)) { // eslint-disable-line no-restricted-globals
    return false;
  }
  return Number.isInteger(parseFloat(value));
}

/* eslint-disable */
export function validation(conf) {
  return (target, property, descriptor) => {
    target[property].validation = conf;
  };
}

export const replaceListBySingle = (obj, key) => {
  if (1 < obj[`${key}s`].length) {
    throw new Error(`${obj} is supposed to have only on attribute ${key}`)
  }
  return _.assign({},
    _.omit(obj, `${key}s`),
    obj[`${key}s`].length === 0 ? { [key]: null } : { [key]: obj[`${key}s`][0] }
  );
};

export const filterAsync = (array, filter) => Promise
  .all(array.map(entry => filter(entry)))
  .then(bits => array.filter(() => bits.shift()));

export function getIp(req) {
  const ipNginx = req.headers['x-forwarded-for'];
  if (ipNginx) return ipNginx.split(', ')[0];
  return req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

export function omitTimes(x, { also = [] } = {}) {
  const _omit = (y => _.omit(y, ['created_at', 'updated_at', 'takenAt', 'deleted_at', ...also]));
  return isArray(x) ? x.map(_omit) : _omit(x);
}

export function sortByOmitTimes(x, { sortBy = 'id', also = [] } = {}) {
  return omitTimes(_.sortBy(x, sortBy), { also });
}

export function createConfiguredMulter(fileSizeMax = 256) {
  const storage = multer.memoryStorage();
  return multer({ storage, limits: { fileSize: fileSizeMax } });
}

export const formatDate = (_date) => {
  if (typeof _date === 'string') {
    return moment(new Date(_date)).toISOString();
  }
  return moment(_date).toISOString();
};

export const isEqualOrBeforeDate = (date, referenceDate) => moment(date).isSameOrBefore(referenceDate, 'day');

export const diffFlatProperties = (obj1, obj2, formatter = _.identity) => {
  const newData = formatter(obj1);
  const previousData = formatter(obj2);
  return _.keys(newData).filter(k => newData[k] !== previousData[k]);
};


const keysDeepInner = (obj, prefix = '') => {
  if (_.isArray(obj)) {
    if (obj.length === 0) return prefix;
    return keysDeepInner(obj[0], prefix);
  }
  if (_.isObject(obj)) return _.flatten(_.keys(obj).map(k => keysDeepInner(obj[k], `${prefix}${k}.`)));
  return prefix;
};

export const keysDeep = obj => {
  const rv = keysDeepInner(obj);
  return (_.flatten(rv)).map(x => x.replace(/.$/, ''));
};

export const mkdirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

export const randomDate = (start, end) => moment(start)
  .add({
    days: Math.random() * (moment(end)
      .diff(start, 'days'))
  })
  .toISOString();

export class Env {
  static get current() {
    return config.env
  }

  static get isTest() {
    return ENVS.TEST === Env.current
  }

  static get isLocal() {
    return ENVS.LOCAL === Env.current
  }

  static get isProd() {
    return ENVS.PROD === Env.current
  }
}

// this is used to debug sequelize
export const getIncludes = (opts) => {
  if (opts && opts.isSequelizeModel === true) return opts;
  if (_.isNil(opts)) return opts;
  if (_.isArray(opts)) return opts.map(getIncludes);
  const keys = _.keys(opts);
  const values = keys.map(k => opts[k]);
  const valuesReformatted = _.zipWith(keys, values, (k, v) => {
    // console.log('\nk', k);
    // console.log('v', v);
    if (k === 'include') {
      // console.log('is include');
      return getIncludes(v);
    }
    if (k === 'model') return v.tableName;
    // console.log('is undefined');
    return undefined;
  });
  return _.omitBy(_.zipObject(keys, valuesReformatted), _.isUndefined);
};
export const validateBase = (obj, schema, { message = null } = {}) => Joi.assert(obj, schema, message);

export const reformatOpts = (opts) => {
  if (opts && opts.isSequelizeModel === true) return opts;
  if (_.isNil(opts)) return opts;
  const keys = _.keys(opts);
  const values = keys.map(k => opts[k]);
  const valuesReformatted = _.zipWith(keys, values, (k, v) => {
    if (k !== 'include') return v;
    if (_.isArray(v)) return v;
    return [reformatOpts(v)];
  });
  return _.zipObject(keys, valuesReformatted);
};

export const upperCaseFirstLetter = str => _.upperFirst(str);

export const getFirstEC = employee => employee.employmentContracts[0];

export const getAnyWorkRelationIdOfEmployee = employee => _.map(employee.employmentContracts, 'workRelationId')[0];

export const checkAssertions = async promiseList => _(await Promise.all(promiseList)).compact().each(err => {
  throw err;
});

export const getDate = (date) => date && moment(date).local().format('YYYY-MM-DD');

export const getIsoDate = (date, nowIfNoDate = true, defaultValue = null) => {
  if (!date && !nowIfNoDate) return defaultValue;
  const mDate = date ? moment(date) : moment();
  return mDate.toISOString();
};

export const getFiles = entity => (entity.fileMeta && entity.fileMeta.files) || [];

export const getFile = (entity) => {
  const filesArray = getFiles(entity);
  if (filesArray.length > 1) throw new BackError(`Entity should have at most 1 file, has ${filesArray.length}`);
  return filesArray[0] || {};
};

export const FILE_FORMAT = {
  PDF: '.pdf',
  PXF: '.pxf',
  BMP: '.bmp',
  JPG: '.jpg',
  PNG: '.png',
  PEM: '.pem',
  P12: '.p12',
  CSV: '.csv',
};

export const newWriteFileAsync = async (format, { writeData = null } = {}) => {
  const file = await new Promise((resolve, reject) => tmp.file({ postfix: format }, (err, path, fd, cleanupCallback) => {
    if (err) reject(err);
    resolve({
      removeCallback: () => cleanupCallback(),
      name: path,
    });
  }));
  if (writeData) await fs.writeFileAsync(file.name, writeData);
  return file;
};

export function streamToBufferPromise(stream) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on('data', (d) => {
      buffers.push(d);
    });
    ['close', 'end'].forEach(endEvent =>
      stream.on(endEvent, () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer);
      })
    );
    stream.on('error', err => reject(err));
  });
}

export function bufferToStream(buffer) {
  const passThrough = new stream.PassThrough();
  passThrough.end(buffer);
  return passThrough;
}

export const renameKeys = (keysMap, obj) => Object
  .keys(obj)
  .reduce((acc, key) => ({
    ...acc,
    ...{ [keysMap[key] || key]: obj[key] }
  }), {});

export const recursivelyPopKeys = (o, keysToPop) => _.reduce(o, (acc, v, k) => {
  if (!_.includes(keysToPop, k) && typeof v !== 'object') {
    acc[k] = v;
  }
  if (Array.isArray(v)) {
    acc[k] = _.map(v, vi => recursivelyPopKeys(vi, keysToPop));
  } else if (typeof v === 'object') {
    const candidate = recursivelyPopKeys(v, keysToPop);
    if (!_.isEmpty(candidate)) {
      acc[k] = candidate;
    }
  }
  return acc;
}, {});

export const setToMidnight = m => moment(m)
  .set({ millisecond: 0, second: 0, minute: 0, hour: 0 });

export const setToMidday = m => moment(m)
  .set({ millisecond: 0, second: 0, minute: 0, hour: 8 });

export const getAge = birthdate => moment()
  .diff(birthdate, 'years');
