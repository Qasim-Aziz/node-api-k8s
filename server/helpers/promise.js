import Promise from 'bluebird';
import _ from 'server/helpers/lodash';

export const promiseMapSeries = async (input, callback) => Promise.mapSeries(input, callback || (val => (val)));
export const promiseMap = async (input, mapper = val => (val), options) => Promise.mapSeries(input || [], mapper, { concurrency: 15, ...options });

export const promiseMapSeriesByQuantity = async (quantity, callback) => promiseMapSeries(_.range(_.ceil(quantity)), callback);

export const transformAsync = async (obj, asyncTransformMethod) => {
  const isArray = _.isArray(obj);
  const newObjPromise = _.transform(obj, asyncTransformMethod);
  const valsResolved = await promiseMap(_.values(newObjPromise));
  const keys = _.keys(newObjPromise);
  return _.flow([_.zip, _.fromPairs, o => (isArray ? _.toArray(o) : o)])(keys, valsResolved);
};
