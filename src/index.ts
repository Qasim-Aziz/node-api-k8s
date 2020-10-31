import app from 'src/application';
import config from 'src/config';
import {logger} from "src/server/helpers";


const port = config.get('app.port') || 3000;
const server = app.listen(port)
server.on('listening', () => logger.info(`Listening to port: ${port}`));
server.on('error', (err: Error) => logger.error(err));
