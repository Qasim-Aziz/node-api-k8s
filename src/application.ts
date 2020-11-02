import path from 'path';
import { Strategy as JWTStrategy } from 'passport-jwt/lib';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
// import SegfaultHandler from 'segfault-handler';
import passport from 'passport';
import httpStatus from 'http-status';

import routes from 'src/server/routes';
import config from 'src/config';
import converterErrorHandler from 'src/server/middlewares/converter_error_handler';
import logErrors from 'src/server/middlewares/log_errors';
import apiErrorHandler from 'src/server/middlewares/api_error_handler';
import clsLoggerMiddleware from 'src/server/middlewares/cls_logger_middleware';
import notFound from 'src/server/middlewares/not_found';
import logRequestMiddleware from 'src/server/middlewares/log_request';
import { User } from 'src/orm';
import { moment } from 'src/server/helpers';

// SegfaultHandler.registerHandler();

const app = express();

// Context aware logger
app.use(clsLoggerMiddleware());

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// log request
app.use(logRequestMiddleware());

app.use(cookieParser(config.get('app.jwtSecret')));
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(passport.initialize());

app.all('/api/*', (req, res, next) => {
  if (req.path.includes('/api/auth/login') || req.path.includes('/api/auth/register')
    || req.path.includes('/api/users/by-email') || req.path.includes('/api/users/by-pseudo')) return next();

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: (request) => request.cookies.jwt,
    secretOrKey: config.get('app.jwtSecret'),
  }, async (jwtPayload, done) => {
    if (moment() > moment(jwtPayload.expires)) return done(null, false, { message: 'jwt expired' });
    const user = await User.findOne({ where: { id: jwtPayload.userId } });
    if (user) return done(null, user.toJSON());
    return done(null, false);
  }));

  return passport.authenticate('jwt', { session: false, failWithError: true }, (err, user) => {
    if (err) { return next(err); }
    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No user' });
    req.user = user;
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
