import * as dotenv from 'dotenv'
import * as routes from './routes'
import hbs from 'hbs'
import express from 'express'
import { logger } from "./logger"

// Load environment variables
dotenv.config({path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local'})

export const app = express()
const port = process.env.APP_NAME == 'node-preprod' ? 3002 : 3001 ;

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