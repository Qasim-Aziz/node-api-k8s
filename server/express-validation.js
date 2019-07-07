// import validation from 'express-validation';
import validation from 'server/helpers/express-validation';

validation.options({
  allowUnknownBody: false,
  allowUnknownHeaders: true,
  allowUnknownQuery: false,
  allowUnknownParams: false,
  allowUnknownCookies: true
});

export default validation;
