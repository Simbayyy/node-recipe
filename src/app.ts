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
const port = 3000;

app.use(express.json())
app.use('/', routes.router)
app.set('view engine', hbs)

  if (process.env.IN_CI != 'true'){
    logger.log({
      level:'info',
      message:"Attempting check for creation of clean new tables"
    })
  let is_db_initialized = pool.query("SELECT * FROM information_schema.tables \
    WHERE table_name = 'recipe';").then(async (result) => {
        if (result.rows.length == 0) {
          await pool.query("CREATE TABLE recipe (\
            recipe_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(500),\
            url VARCHAR(500) UNIQUE \
            );")
          await pool.query("CREATE TABLE ingredient (\
            ingredient_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(200) UNIQUE\
            );")
          await pool.query("CREATE TABLE recipe_ingredient (\
            recipe_id INT,\
            ingredient_id INT,\
            amount INT, \
            unit VARCHAR(100),\
            PRIMARY KEY (recipe_id, ingredient_id),\
            CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id),\
            CONSTRAINT fk_ingredient FOREIGN KEY(ingredient_id) REFERENCES ingredient(ingredient_id)\
            );")
        }
      })
}
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