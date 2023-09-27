import { logger } from "../logger";
import { pool } from "../db";

logger.log({
    level:'info',
    message:"Resetting DB tables"
})
reset_db()

export async function reset_db() {
    await pool.query("DROP TABLE IF EXISTS recipe, ingredient, recipe_ingredient, recipe_time")
    await pool.query("CREATE TABLE recipe (\
        recipe_id SERIAL NOT NULL PRIMARY KEY,\
        name VARCHAR(500),\
        url VARCHAR(500) UNIQUE, \
        prepTime VARCHAR(20),\
        cookTime VARCHAR(20),\
        totalTime VARCHAR(20),\
        recipeYield VARCHAR(50),\
        recipeCategory VARCHAR(50),\
        recipeCuisine VARCHAR(50)\
        );")
    await pool.query("CREATE TABLE ingredient (\
        ingredient_id SERIAL NOT NULL PRIMARY KEY,\
        name VARCHAR(200) UNIQUE,\
        name_en VARCHAR(200),\
        fdc_id INT,\
        high_confidence BOOLEAN DEFAULT FALSE\
        );")
    await pool.query("CREATE TABLE recipe_ingredient (\
        id SERIAL NOT NULL PRIMARY KEY,\
        recipe_id INT,\
        ingredient_id INT,\
        amount INT, \
        unit VARCHAR(100),\
        CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id),\
        CONSTRAINT fk_ingredient FOREIGN KEY(ingredient_id) REFERENCES ingredient(ingredient_id)\
        );")
}