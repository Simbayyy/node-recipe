import { Pool } from 'pg'
import { Recipe, isRecipe } from './types'
import * as dotenv from 'dotenv'
import { logger } from './app'
import { sanitizeRecipe } from './functions'

// Load environment variables
dotenv.config({path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local'})

// Connect to PostgreSQL database
export const pool = new Pool({
    user: process.env.PGUSER || '',
    database: process.env.PGNAME || '',
    password: process.env.PGPASSWORD || '',
    port: 5432,
    host: 'localhost',
  })

export async function insertRecipe(unsanitized_recipe: any) {
    if (isRecipe(unsanitized_recipe)) {
        // Sanitize input
        let recipe = sanitizeRecipe(unsanitized_recipe) 
        try {
            // Attempts to insert recipe
            let response = await pool.query(`INSERT INTO \
            ${process.env.DB_ENV == 'test' ? "test_" : ""}recipe(name,url) \
            VALUES($1, $2) \
            RETURNING recipe_id`, [recipe.name, recipe.url])
            let new_recipe_id = response.rows[0].recipe_id
            logger.log({
                level: 'info',
                message: `Successfully created recipe with id ${new_recipe_id}`            
            }) 
            // Attempts to insert all ingredients  
            let ingredients_id = await Promise.all(recipe.ingredients.map(async (ingredient, index) => {
                let check_ingredient = await pool.query(`SELECT ingredient_id \
                FROM ${process.env.DB_ENV == 'test' ? "test_" :""}ingredient \
                WHERE name = $1`, [ingredient.name])
                let ingredient_id: number
                if (check_ingredient.rows.length == 0) {
                    let insert_ingredient = await pool.query(`INSERT INTO \
                    ${process.env.DB_ENV == 'test' ? "test_" : ""}ingredient(name) \
                    VALUES($1) \
                    RETURNING ingredient_id`, [ingredient.name])
                    ingredient_id = insert_ingredient.rows[0].ingredient_id
                } else {
                    ingredient_id = check_ingredient.rows[0].ingredient_id
                }
                await pool.query(
                    `INSERT INTO \
                    ${process.env.DB_ENV == 'test' ? "test_" : ""}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
                    VALUES($1, $2, $3, $4);`,
                    [new_recipe_id, ingredient_id, ingredient.amount, ingredient.unit])
                logger.log({
                    level: 'info',
                    message: `Successfully inserted ingredient ${index} in the database with id ${ingredient_id}`            
                })
                return ingredient_id
            }))
            logger.log({
                level: 'info',
                message: `Successfully inserted its ingredients in the database with ids ${ingredients_id}`            
            })
            return response
        } catch (e) {
            logger.log({
                level: 'error',
                message: `Failed with insertion of recipe from ${recipe.url}\nError message is ${e}\nIngredient list: ${recipe.ingredients}`            
            })  
            return undefined
        }
    } else {
        logger.log({
            level: 'error',
            message: `Recipe from ${unsanitized_recipe.url ? unsanitized_recipe.url : "unrecognized URL"} is in fact not a recipe`            
        })  
        return undefined
    }
}