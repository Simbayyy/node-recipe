import { Pool } from 'pg'
import { Ingredient, IngredientRaw, Recipe, RecipeSchema, isRecipe } from './types'
import * as dotenv from 'dotenv'
import { logger } from './logger'
import { getFoodData, sanitizeRecipe, sanitizeRecipeSchema, sortIngredients, translateIngredient } from './functions'

// Load environment variables
dotenv.config({path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local'})

// Prefix (or not) test_ to table names 
export const test_ = process.env.DB_ENV == 'test' ? "test_" : ""

// Connect to PostgreSQL database
export const pool = new Pool({
    user: process.env.PGUSER || '',
    database: process.env.PGNAME || '',
    password: process.env.PGPASSWORD || '',
    port: 5432,
    host: 'localhost',
  })

export async function insertRecipeSchema(recipe: RecipeSchema) {
    try {
        if (!(('name' in recipe) && ('url' in recipe))) {
            throw Error('This is not a recipe')
        }
        // Attempts to insert recipe
        let response = await pool.query(`INSERT INTO \
        ${test_}recipe(name,url,prepTime,cookTime,totalTime,recipeYield,recipeCategory,recipeCuisine) \
        VALUES($1, $2, $3, $4, $5, $6, $7, $8) \
        RETURNING recipe_id`, [
            recipe.name, 
            recipe.url, 
            recipe.prepTime || "",
            recipe.cookTime || "",
            recipe.totalTime || "",
            recipe.recipeYield || "",
            recipe.recipeCategory || "",
            recipe.recipeCuisine || "",
        ])
        let new_recipe_id = response.rows[0].recipe_id
        logger.log({
            level: 'info',
            message: `Successfully created recipe with id ${new_recipe_id}`            
        }) 

        // Attempts to insert all ingredients  
        let ingredients_id = await Promise.all((recipe.recipeIngredient || []).map(async (ingredient, index) => {
            let check_ingredient = await pool.query(`SELECT ingredient_id \
            FROM ${process.env.DB_ENV == 'test' ? "test_" :""}ingredient \
            WHERE name = $1`, [ingredient.name])
            let ingredient_id: number
            if (check_ingredient.rows.length == 0) {
                let insert_ingredient = await pool.query(`INSERT INTO \
                ${test_}ingredient(name) \
                VALUES($1) \
                RETURNING ingredient_id`, [ingredient.name])
                ingredient_id = insert_ingredient.rows[0].ingredient_id
            } else {
                ingredient_id = check_ingredient.rows[0].ingredient_id
            }
            await pool.query(
                `INSERT INTO \
                ${test_}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
                VALUES($1, $2, $3, $4);`,
                [
                    new_recipe_id,
                    ingredient_id,
                    Math.floor(ingredient.amount * 100),
                    ingredient.unit
                ])
            logger.log({
                level: 'info',
                message: `Successfully inserted ingredient ${index} in the database with id ${ingredient_id}`            
            })
            await addTranslatedName(ingredient_id)
            await addFoodData(ingredient_id)
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
            message: `Failed with insertion of recipe from ${recipe.url}\nError message is ${e}`            
        })  
        return undefined
    }
}


export async function insertRecipe(unsanitized_recipe: any) {
    if (isRecipe(unsanitized_recipe)) {
        // Sanitize input
        let recipe = sanitizeRecipe(unsanitized_recipe) 
        try {
            // Attempts to insert recipe
            let response = await pool.query(`INSERT INTO \
            ${test_}recipe(name,url) \
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
                    ${test_}ingredient(name) \
                    VALUES($1) \
                    RETURNING ingredient_id`, [ingredient.name])
                    ingredient_id = insert_ingredient.rows[0].ingredient_id
                } else {
                    ingredient_id = check_ingredient.rows[0].ingredient_id
                }
                await pool.query(
                    `INSERT INTO \
                    ${test_}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
                    VALUES($1, $2, $3, $4);`,
                    [new_recipe_id, ingredient_id, ingredient.amount, ingredient.unit])
                logger.log({
                    level: 'info',
                    message: `Successfully inserted ingredient ${index} in the database with id ${ingredient_id}`            
                })
                await addTranslatedName(ingredient_id)
                await addFoodData(ingredient_id)
                return ingredient_id
            }))
            logger.log({
                level: 'info',
                message: `Successfully inserted its ingredients in the database with ids ${ingredients_id}`            
            })

            // Attempt to insert time
            let insert_time = await pool.query(`INSERT INTO \
            ${test_}recipe_time(recipe_id,time,unit) \
            VALUES($1, $2, $3) \
            RETURNING time_id`, [new_recipe_id, recipe.time.time, recipe.time.unit])
            logger.log({
                level: 'info',
                message: `Successfully inserted its time in the database with ids ${insert_time.rows[0].time_id}`            
            })
            return response
        } catch (e) {
            logger.log({
                level: 'error',
                message: `Failed with insertion of recipe from ${recipe.url}\nError message is ${e}. \nTime to be inserted was ${['recipe_id', recipe.time.time, recipe.time.unit]}`            
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

export async function selectRecipe (recipeId: number) {
    try 
        {const query = `SELECT * \
            FROM ${process.env.DB_ENV == 'test' ? "test_" :""}recipe \
            WHERE recipe_id = $1`
        const values = [recipeId]

        const result = await pool.query(query, values);

        if (result.rows.length != 0){
            let ingredients_id = await pool.query(`SELECT i.name, ri.amount, ri.unit, i.name_en, i.fdc_id, i.high_confidence \
                FROM ${test_}ingredient AS i \
                INNER JOIN ${test_}recipe_ingredient AS ri\
                ON ri.recipe_id = $1\
                WHERE i.ingredient_id = ri.ingredient_id;`, [recipeId])
            let recipe: RecipeSchema = {
                name: result.rows[0].name,
                url: result.rows[0].url,
                prepTime: result.rows[0].preptime,
                cookTime: result.rows[0].cooktime,
                totalTime: result.rows[0].totaltime,
                recipeCuisine: result.rows[0].recipeCuisine,
                recipeInstructions: result.rows[0].recipeInstructions,
                recipeCategory: result.rows[0].recipeCategory,
                recipeYield: result.rows[0].recipeYield,
                recipeIngredient: ingredients_id.rows,
                id:recipeId
            }
            return sanitizeRecipeSchema(recipe)
        } else {
            throw Error("No recipe found")
        }
    } catch (e) {
        logger.log({
            level:'error',
            message:`Could not fetch recipe\nError: ${e}`
        })
        throw Error(`Could not fetch recipe. Error:\n${e}`)
    }
} 


export async function selectIngredient (ingredientId: number) {
    try 
        {const query = `SELECT * \
            FROM ${process.env.DB_ENV == 'test' ? "test_" :""}ingredient \
            WHERE ingredient_id = $1`
        const values = [ingredientId]

        const result = await pool.query(query, values);

        if (result.rows.length != 0){
            let ingredient:IngredientRaw = result.rows[0]
            return ingredient
        } else {
            throw Error("No ingredient found")
        }
    } catch (e) {
        logger.log({
            level:'error',
            message:`Could not fetch ingredient\nError: ${e}`
        })
        return {}
    }
} 

export async function addTranslatedName (ingredientId: number) {
    let ingredientName = await pool.query(`SELECT name FROM ${test_}ingredient WHERE ingredient_id = $1`, [ingredientId])
    if (ingredientName.rows.length != 0) {
        let name = ingredientName.rows[0].name
        let name_en = await translateIngredient(name)
        let insert_en = await pool.query(`UPDATE ${test_}ingredient SET name_en = $1 WHERE ingredient_id = $2`, [name_en,ingredientId])
        logger.log({
            level:'info',
            message:`Translated ${name} to ${name_en}`
        })
        return name_en
    }
} 

export async function addFoodData (ingredientId: number) {
    let ingredientName = await pool.query(`SELECT name_en FROM ${test_}ingredient WHERE ingredient_id = $1`, [ingredientId])
    if (ingredientName.rows.length != 0) {
        let name_en = ingredientName.rows[0].name_en
        let fdc_response = await getFoodData(name_en)
        try {
            let insert_food = await pool.query(`UPDATE ${test_}ingredient SET fdc_id = $1 WHERE ingredient_id = $2`, [fdc_response.foods[0].fdcId,ingredientId])
            let confidence = (fdc_response.query == 'strict')
            if (confidence) {
                await pool.query(`UPDATE ${test_}ingredient SET high_confidence = TRUE WHERE ingredient_id = $1`, [ingredientId])
            }
            logger.log({
                level:'info',
                message:`Found and added fdc data for ingredient ${name_en}, ${confidence ? 'high' : 'low'} confidence`
            })
        } catch (e) {
            logger.log({
                level:'info',
                message:`Could not find fdc data for ingredient ${name_en}\nReceived:${fdc_response?.error} with ${fdc_response.query} querying\nError: ${e}`
            })
        }
        return fdc_response
    }
} 