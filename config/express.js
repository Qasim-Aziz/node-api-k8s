import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';
import SegfaultHandler from 'segfault-handler';

import routes from 'server/routes';
import config from 'config/env';
import converterErrorHandler from 'server/middlewares/converter_error_handler';
import logErrors from 'server/middlewares/log_errors';
import apiErrorHandler from 'server/middlewares/api_error_handler';
import clsLoggerMiddleware from 'server/middlewares/cls_logger_middleware';
import notFound from 'server/middlewares/not_found';
import logRequestMiddleware from 'server/middlewares/log_request';

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
