

const Joi = require('joi');
const assignIn = require('lodash/assignIn');
const find = require('lodash/find');
const defaults = require('lodash/defaults');
const ValidationError = require('./validation-error');

const defaultOptions = {
  contextRequest: false,
  allowUnknownHeaders: true,
  allowUnknownBody: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true,
  status: 400,
  statusText: 'Bad Request'
};
let globalOptions = {};

// maps the corresponding request object to an `express-validation` option
const unknownMap = {
  headers: 'allowUnknownHeaders',
  body: 'allowUnknownBody',
  query: 'allowUnknownQuery',
  params: 'allowUnknownParams',
  cookies: 'allowUnknownCookies'
};

exports = module.exports = function (schema) {
  if (!schema) throw new Error('Please provide a validation schema');

  return function (req, res, next) {
    const errors = [];

    // Set default options
    const options = defaults({}, schema.options || {}, globalOptions, defaultOptions);

    // NOTE: mutates `errors`
    ['headers', 'body', 'query', 'params', 'cookies'].forEach((key) => {
      const allowUnknown = options[unknownMap[key]];
      const entireContext = options.contextRequest ? req : null;
      if (schema[key]) {
        validate(errors, req[key], schema[key], key, allowUnknown, entireContext);
      } else if (!allowUnknown) {
//        console.log(`Now locking up ${key}`);
//        console.log(`Query was ${req.method} on ${req.originalUrl}`)
//        console.log(`Request was ${JSON.stringify(req[key])}`);
//        console.log(`Schema was ${JSON.stringify(schema)}`);
        validate(errors, req[key], {}, key, allowUnknown, entireContext);
      }
    });

    if (errors && errors.length === 0) return next();

    return next(new ValidationError(errors, options));
  };
};

exports.ValidationError = ValidationError;

exports.options = function (opts) {
  if (!opts) {
    globalOptions = {};
    return;
  }

  globalOptions = defaults({}, globalOptions, opts);
};

/**
 * validate checks the current `Request` for validations
 * NOTE: mutates `request` in case the object is valid.
 */
function validate(errObj, request, schema, location, allowUnknown, context) {
  if (!request || !schema) return;

  const joiOptions = {
    context: context || request,
    allowUnknown,
    abortEarly: false
  };

  Joi.validate(request, schema, joiOptions, (errors, value) => {
    if (!errors || errors.details.length === 0) {
      assignIn(request, value); // joi responses are parsed into JSON
      return;
    }

    errors.details.forEach((error) => {
      const errorExists = find(errObj, (item) => {
        if (item && item.field === error.path && item.location === location) {
          item.messages.push(error.message);
          item.types.push(error.type);
          return item;
        }
      });

      if (!errorExists) {
        errObj.push({
          field: error.path,
          location,
          messages: [error.message],
          types: [error.type]
        });
      }
    });
  });
}
