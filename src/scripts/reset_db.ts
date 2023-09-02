import { logger } from "../logger";
import { pool } from "../db";

logger.log({
    level:'info',
    message:"Resetting DB tables"
})
reset_db()

async function reset_db() {
    await pool.query("DROP TABLE IF EXISTS recipe, ingredient, recipe_ingredient, recipe_time")
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
    await pool.query("CREATE TABLE recipe_time (\
    time_id SERIAL NOT NULL PRIMARY KEY,\
    recipe_id INT,\
    time INT, \
    unit VARCHAR(100),\
    CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id)\
    );")
}