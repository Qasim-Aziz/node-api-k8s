import Joi from 'joi';
import { ValidationError } from 'src/server/helpers';

const defaultOptions = {
  contextRequest: false,
  allowUnknownHeaders: true,
  allowUnknownBody: true,
  allowUnknownQuery: true,
  allowUnknownParams: true,
  allowUnknownCookies: true,
  status: 400,
  statusText: 'Bad Request',
};

const globalOptions = {};

const unknownMap = {
  headers: 'allowUnknownHeaders',
  body: 'allowUnknownBody',
  query: 'allowUnknownQuery',
  params: 'allowUnknownParams',
  cookies: 'allowUnknownCookies',
};

const validate = (errObj, request, schema, location, allowUnknown, context) => {
  if (!request || !schema) return;

  const joiOptions = {
    context: context || request,
    allowUnknown,
    abortEarly: false,
  };
  const { error, value } = Joi.object(schema).required().validate(request, joiOptions);
  if (!error || error.details.length === 0) {
    Object.assign(request, value);
    return;
  }

  error.details.forEach((err) => {
    const errorExists = errObj.find((item) => {
      if (item && item.field === err.path && item.location === location) {
        item.messages.push(err.message);
        item.types.push(err.type);
        return item;
      }
      return false;
    });

    if (!errorExists) {
      errObj.push({
        field: err.path,
        location,
        messages: [err.message],
        types: [err.type],
      });
    }
  });
};

export const apiRequestValidator = (schema) => {
  if (!schema) throw new Error('Please provide a validation schema');

  return function (req, res, next) {
    const errors = [];

    // Set default options
    const options = { ...defaultOptions, ...globalOptions, ...schema.options || {} };

    // NOTE: mutates `errors`
    ['headers', 'body', 'query', 'params', 'cookies'].forEach((key) => {
      const allowUnknown = options[unknownMap[key]];
      const entireContext = options.contextRequest ? req : null;
      if (schema[key]) {
        validate(errors, req[key], schema[key], key, allowUnknown, entireContext);
      } else if (!allowUnknown) {
        validate(errors, req[key], {}, key, allowUnknown, entireContext);
      }
    });

    if (errors && errors.length === 0) return next();

    return next(new ValidationError(errors, options));
  };
};
