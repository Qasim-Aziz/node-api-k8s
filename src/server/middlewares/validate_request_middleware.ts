import Joi from 'joi';
import { ValidationError } from '../helpers';

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

  const { errors, value } = Joi.object(schema).validate(request, joiOptions);
  if (!errors || errors.details.length === 0) {
    Object.assign(request, value);
    return;
  }

  errors.details.forEach((error) => {
    const errorExists = errObj.find((item) => {
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
        types: [error.type],
      });
    }
  });
};

export default function (schema) {
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
}
