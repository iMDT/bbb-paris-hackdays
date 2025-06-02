import express from 'express';
import createRoutes from './routes/create';

const config = require('./config');
const serverSecuritySalt = require('./serverSecuritySalt');
import logger from './utils/logger';

const app = express();

app.use(express.json({ limit: config.get("server_request_max_body_size") }));
app.use(express.urlencoded({ extended: true }));

app.use('/', createRoutes);


const startServer = () => {
    logger.info('Starting server');
    serverSecuritySalt.loadSecuritySalt();

    app.listen(config.get("server_port"), config.get("server_host"), () => {
        logger.info(`Server is running on ${config.get("server_host")}:${config.get("server_port")}`);
    });
};

logger.debug('Debug mode Enabled!');

startServer();
