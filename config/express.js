import path from 'path';

import { Strategy as JWTStrategy } from 'passport-jwt/lib';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import SegfaultHandler from 'segfault-handler';
import passport from 'passport';
import httpStatus from 'http-status';

import routes from 'server/routes';
import config from 'config/env';
import converterErrorHandler from 'server/middlewares/converter_error_handler';
import logErrors from 'server/middlewares/log_errors';
import apiErrorHandler from 'server/middlewares/api_error_handler';
import clsLoggerMiddleware from 'server/middlewares/cls_logger_middleware';
import notFound from 'server/middlewares/not_found';
import logRequestMiddleware from 'server/middlewares/log_request';
import { secret } from 'server/constants';
import { User } from 'orm';
import moment from 'server/helpers/moment';

import logger from 'server/helpers/logger';

SegfaultHandler.registerHandler();

const app = express();

// Context aware logger
app.use(clsLoggerMiddleware());

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// log request
app.use(logRequestMiddleware());

app.use(cookieParser(config.jwtSecret));
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

passport.use(new JWTStrategy({
  jwtFromRequest: req => req.cookies.jwt,
  secretOrKey: secret,
}, async (jwtPayload, done) => {
  logger.info('here 2 !!!!!!!')
  logger.info('jwtPayload')
  logger.info(jwtPayload)
  if (moment() > moment(jwtPayload.expires)) return done('jwt expired');
  const user = await User.findOne({ where: { id: jwtPayload.userId } });
  if (user) return done(null, user);
  return done(null, false);
}));

app.use(passport.initialize());

app.all('/api/*', (req, res, next) => {
  if (req.path.includes('/api/auth/login') || req.path.includes('/api/auth/register')) return next();

  return passport.authenticate('jwt', { session: false, failWithError: true }, (err, user) => {
    logger.info('here !!')
    logger.info(err)
    logger.info(user)
    if (err) { return next(err); }
    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No user' });
    app.set('user', user);
    return next();
  })(req, res, next);
});

app.use('/api/public', express.static(path.join(__dirname, '../public')));

// mount all routes on /api path
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(notFound);

// error handlers
app.use(converterErrorHandler);
app.use(logErrors);
app.use(apiErrorHandler);

export default app;
