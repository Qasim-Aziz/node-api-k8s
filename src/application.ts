import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import helmet from 'helmet';

import routes from 'src/server/routes';
import config from 'src/config';
import converterErrorHandler from 'src/server/middlewares/converter_error_handler';
import logErrors from 'src/server/middlewares/log_errors';
import apiErrorHandler from 'src/server/middlewares/api_error_handler';
import { clsLoggerMiddleware } from 'src/server/middlewares/cls_logger_middleware';
import notFound from 'src/server/middlewares/not_found';
import logRequestMiddleware from 'src/server/middlewares/log_request_middleware';

// SegfaultHandler.registerHandler();

const app = express();

// Context aware logger
app.use(clsLoggerMiddleware());

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// log request
app.use(logRequestMiddleware);

app.use(cookieParser(config.get('app.jwtSecret')));
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount all routes on /api path
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(notFound);

// error handlers
app.use(converterErrorHandler);
app.use(logErrors);
app.use(apiErrorHandler);

export default app;
