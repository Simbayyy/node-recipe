"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
app_1.logger.log({
    level: 'info',
    message: `Deployment of app in ${process.env.APP_NAME}, at ${console.time}`
});
process.exitCode = 0;
