import * as http from "http"
import * as winston from "winston"
import * as dotenv from 'dotenv'

dotenv.config({path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local'})

const logger = winston.createLogger({
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

const hostname = 'recipes.sbaillet.com';
const port = 3000;

const server = http.createServer((_,res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Hello World</h1>');
  logger.log({
    level: 'info',
    message: 'Hello distributed log files!'
  });
});

server.listen(port, hostname, () => {
  logger.log({
    level: 'info',
    message: `Server running at http://${hostname}:${port}/`
  });
  logger.log({
    level: 'info',
    message: `Environment variables used are from ${process.env.TEST_VALUE}`
  });
})