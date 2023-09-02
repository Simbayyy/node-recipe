import * as http from "http"
import * as winston from "winston"
import * as dotenv from 'dotenv'
import * as routes from './routes'
import {pool} from './db'
import hbs from 'hbs'
import express from 'express'

// Load environment variables
dotenv.config({path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local'})

// Create logger
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}


export const app = express()
const port = process.env.APP_NAME == 'node-preprod' ? 3000 : 3001 ;

app.use(express.json())
app.use('/', routes.router)
app.set('view engine', hbs)

app.listen(port, async () => {
  logger.log({
    level: 'info',
    message: `Server running on port ${port}`
  });
  logger.log({
    level: 'info',
    message: `Environment variables used are from ${process.env.TEST_VALUE}`
  });
})