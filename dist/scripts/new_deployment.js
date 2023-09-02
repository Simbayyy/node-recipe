"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
logger_1.logger.log({
    level: 'info',
    message: `Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
});
