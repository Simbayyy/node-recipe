import { Pool, type QueryResult } from 'pg'
import { type Ingredient, type IngredientRaw, type RecipeSchema, isRecipe } from './types'
import * as dotenv from 'dotenv'
import { logger } from './logger'
import { sanitizeRecipe, sanitizeRecipeSchema } from './functions'
import { addFoodData } from './food'
import { addTranslatedName } from './translation'

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development.local' })

// Prefix (or not) test_ to table names
export const test_ = process.env.DB_ENV === 'test' ? 'test_' : ''

// Connect to PostgreSQL database
export const pool = new Pool({
  user: process.env.PGUSER ?? '',
  database: process.env.PGNAME ?? '',
  password: process.env.PGPASSWORD ?? '',
  port: 5432,
  host: 'localhost'
})

export async function insertRecipeSchema (recipe: RecipeSchema, userId: number | null = null): Promise<number | undefined> {
  try {
    if (!(('name' in recipe) && ('url' in recipe))) {
      throw Error('This is not a recipe')
    }
    const getSameRecipe = await pool.query(`SELECT recipe_id 
      FROM ${test_}recipe
      WHERE url=$1`, [
        recipe.url
      ])
    if (getSameRecipe.rows.length === 0) {
      // Attempts to insert recipe
      const response = await pool.query(`INSERT INTO
          ${test_}recipe(name,url,prepTime,cookTime,totalTime,recipeYield,recipeInstructions,recipeCategory,recipeCuisine,original_id)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING recipe_id`, [
        recipe.name,
        recipe.url,
        recipe.prepTime ?? '',
        recipe.cookTime ?? '',
        recipe.totalTime ?? '',
        recipe.recipeYield ?? '',
        recipe.recipeInstructions ?? '',
        recipe.recipeCategory ?? '',
        recipe.recipeCuisine ?? '',
        recipe.originalId ?? null,
      ])
      const newRecipeId = response.rows[0].recipe_id
      logger.log({
        level: 'info',
        message: `Successfully created recipe with id ${newRecipeId}`
      })

      
      // Attempts to insert all ingredients
      const ingredientsFirstPass = (recipe.recipeIngredient as Ingredient[] | undefined ?? []).filter((elt, index, arr) => {
        return index === arr.findIndex(object => {
          return object.name === elt.name
      })
    })
    
    const ingredientsSecondPass = (recipe.recipeIngredient as Ingredient[] | undefined ?? []).filter((elt, index, arr) => {
      return index !== arr.findIndex(object => {
        return object.name === elt.name
      })
    })
    
    async function insertIngredient (ingredient: Ingredient, index: number, array?: Ingredient[]): Promise<number> {
      const checkIngredient = await pool.query(`SELECT ingredient_id \
      FROM ${test_}ingredient \
      WHERE name = $1`, [ingredient.name])
      let ingredientId: number
      if (checkIngredient.rows.length === 0) {
        const insertIngredient = await pool.query(`INSERT INTO \
        ${test_}ingredient(name,short_name) \
        VALUES($1,$2) \
        RETURNING ingredient_id`, [ingredient.name,ingredient.short_name ?? "erreur"])
        ingredientId = insertIngredient.rows[0].ingredient_id
      } else {
        ingredientId = checkIngredient.rows[0].ingredient_id
      }
      await pool.query(
        `INSERT INTO \
        ${test_}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
        VALUES($1, $2, $3, $4);`,
        [
          newRecipeId,
          ingredientId,
          Math.floor(ingredient.amount),
          ingredient.unit
        ])
        logger.log({
          level: 'info',
          message: `Successfully inserted ingredient ${index} in the database with id ${ingredientId}`
        })
        const log = await fillIngredientData(ingredientId, ingredient.short_name)
        logger.log({level:"info",message:log})
        return ingredientId
      }
      
      const ingredientsId = await Promise.all(ingredientsFirstPass.map(insertIngredient))
      const ingredientsId2 = await Promise.all(ingredientsSecondPass.map(insertIngredient))
      logger.log({
        level: 'info',
        message: `Successfully inserted its ingredients in the database with ids ${String(ingredientsId)}, ${String(ingredientsId2)}`
      })
      await insertRecipeUserLink(newRecipeId,userId ?? 0)
      return newRecipeId
    } else {
      const newRecipeId = getSameRecipe.rows[0].recipe_id ?? null
      await insertRecipeUserLink(newRecipeId,userId ?? 0)
      return newRecipeId
    }
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: `Failed with insertion of recipe ${recipe.name} from ${recipe.url}\nError message is ${e}`
    })
    return undefined
  }
}

async function insertRecipeUserLink(newRecipeId:number | null ,userId:number) {
  if (newRecipeId !== null) {
    await pool.query(`INSERT INTO ${test_}user_recipe(recipe_id,user_id)
      VALUES($1,$2)`, [
        newRecipeId,
        userId
      ])
  }
}
export async function removeRecipeUserLink(oldRecipeId:number | null ,userId:number) {
  if (oldRecipeId !== null) {
    await pool.query(`DELETE FROM ${test_}user_recipe
      WHERE recipe_id = $1
      AND user_id = $2`, [
        oldRecipeId,
        userId
      ])
  }
}

export async function insertRecipe (unsanitizedRecipe: any): Promise<QueryResult | any> {
  if (isRecipe(unsanitizedRecipe)) {
    // Sanitize input
    const recipe = sanitizeRecipe(unsanitizedRecipe)
    try {
      // Attempts to insert recipe
      const response = await pool.query(`INSERT INTO \
            ${test_}recipe(name,url) \
            VALUES($1, $2) \
            RETURNING recipe_id`, [recipe.name, recipe.url])
      const newRecipeId = response.rows[0].recipe_id
      logger.log({
        level: 'info',
        message: `Successfully created recipe with id ${newRecipeId}`
      })

      // Attempts to insert all ingredients
      const ingredientsId = await Promise.all(recipe.ingredients.map(async (ingredient, index) => {
        const checkIngredient = await pool.query(`SELECT ingredient_id \
                FROM ${process.env.DB_ENV === 'test' ? 'test_' : ''}ingredient \
                WHERE name = $1`, [ingredient.name])
        let ingredientId: number
        if (checkIngredient.rows.length === 0) {
          const insertIngredient = await pool.query(`INSERT INTO \
                    ${test_}ingredient(name) \
                    VALUES($1) \
                    RETURNING ingredient_id`, [ingredient.name])
          ingredientId = insertIngredient.rows[0].ingredientId
        } else {
          ingredientId = checkIngredient.rows[0].ingredientId
        }
        await pool.query(
                    `INSERT INTO \
                    ${test_}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
                    VALUES($1, $2, $3, $4);`,
                    [newRecipeId, ingredientId, ingredient.amount, ingredient.unit])
        logger.log({
          level: 'info',
          message: `Successfully inserted ingredient ${index} in the database with id ${ingredientId}`
        })
        const log = await fillIngredientData(ingredientId, ingredient.short_name)
        logger.log({level:"info",message:log})
        return ingredientId
        }))
      logger.log({
        level: 'info',
        message: `Successfully inserted its ingredients in the database with ids ${String(ingredientsId)}`
      })

      // Attempt to insert time
      const insertTime = await pool.query(`INSERT INTO \
            ${test_}recipe_time(recipe_id,time,unit) \
            VALUES($1, $2, $3) \
            RETURNING time_id`, [newRecipeId, recipe.time.time, recipe.time.unit])
      logger.log({
        level: 'info',
        message: `Successfully inserted its time in the database with ids ${insertTime.rows[0].time_id}`
      })
      return newRecipeId
    } catch (e: any) {
      logger.log({
        level: 'error',
        message: `Failed with insertion of recipe from ${recipe.url}\nError message is ${e}.`
      })
      return undefined
    }
  } else {
    logger.log({
      level: 'error',
      message: `Recipe from ${'url' in unsanitizedRecipe ? unsanitizedRecipe.url : 'unrecognized URL'} is in fact not a recipe`
    })
    return undefined
  }
}

export async function selectRecipe (recipeId: number, userId:number | null = null, force:boolean = false): Promise<RecipeSchema | {error:string}> {
  try {
    const usersLinkedToRecipe = await pool.query(`SELECT user_id FROM user_recipe
      WHERE recipe_id=$1`, [
        recipeId
      ])
    if (!force && usersLinkedToRecipe.rows.length !== 0) {
      const allowedUsers = usersLinkedToRecipe.rows.map((elt) => {return elt.user_id})
      if (allowedUsers.indexOf(userId) === -1) {
        const isRecipeAdmin = await pool.query(`SELECT CASE
            WHEN EXISTS (SELECT 1 FROM users WHERE id = ANY($1::int[]) AND admin = true) THEN true
            ELSE false
          END AS has_admin
        `, [allowedUsers])
        if (!(isRecipeAdmin.rows[0].has_admin)) {
          logger.log({
            level: 'error',
            message: `User ${userId} attempted to access ${recipeId} but did not have permission to do so`
          })      
          return {error:`Could not fetch recipe`}
        }
      }
    }

    const query = `SELECT * \
            FROM ${process.env.DB_ENV === 'test' ? 'test_' : ''}recipe \
            WHERE recipe_id = $1`
    const values = [recipeId]

    const result = await pool.query(query, values)
    if (result.rows.length !== 0) {
      const ingredientsId = await pool.query(`SELECT i.name, i.density, i.short_name, ri.amount, ri.unit, i.name_en, i.fdc_id, i.high_confidence, i.lipid, i.energy, i.protein, i.carbohydrates, i.iron, i.zinc, i.magnesium, i.sodium, i.calcium, i.fiber \
                FROM ${test_}ingredient AS i \
                INNER JOIN ${test_}recipe_ingredient AS ri\
                ON ri.recipe_id = $1\
                WHERE i.ingredient_id = ri.ingredient_id;`, [recipeId])
      const recipe: RecipeSchema = {
        name: result.rows[0].name,
        url: result.rows[0].url,
        prepTime: result.rows[0].preptime,
        cookTime: result.rows[0].cooktime,
        totalTime: result.rows[0].totaltime,
        recipeCuisine: result.rows[0].recipecuisine,
        recipeInstructions: result.rows[0].recipeinstructions,
        recipeCategory: result.rows[0].recipecategory,
        recipeYield: result.rows[0].recipeyield,
        recipeIngredient: ingredientsId.rows,
        id: recipeId,
        originalId: result.rows[0].original_id
      }
      return sanitizeRecipeSchema(recipe)
    } else {
      throw Error('No recipe found')
    }
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: `Could not fetch recipe\nError: ${e}`
    })
    throw Error(`Could not fetch recipe. Error:\n${e}`)
  }
}

export async function selectIngredient (ingredientId: number): Promise<IngredientRaw> {
  try {
    const query = `SELECT * \
            FROM ${process.env.DB_ENV === 'test' ? 'test_' : ''}ingredient \
            WHERE ingredient_id = $1`
    const values = [ingredientId]

    const result = await pool.query(query, values)

    if (result.rows.length !== 0) {
      const ingredient: IngredientRaw = result.rows[0]
      return ingredient
    } else {
      throw Error('No ingredient found')
    }
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: `Could not fetch ingredient\nError: ${e}`
    })
    throw Error(`Could not fetch ingredient\nError: ${e}`)
  }
}

async function fillIngredientData(ingredientId: number, short_name: string | undefined) {
  if (short_name != undefined) {
    const sameShortNameIngredients = await pool.query(`SELECT * \
      FROM ${test_}ingredient \
      WHERE short_name = $1 \
      ORDER BY ingredient_id;` , [short_name])  
    if (sameShortNameIngredients.rows.length > 1 || (sameShortNameIngredients.rows[0].name_en != undefined && sameShortNameIngredients.rows[0].fdc_id != undefined)) {
      const refIngredient = sameShortNameIngredients.rows[0]
      await pool.query(`UPDATE ${test_}ingredient \
        SET fdc_id = $1, name_en = $2, high_confidence = $3 \
        WHERE ingredient_id = $4`, [refIngredient.fdc_id, refIngredient.name_en, refIngredient.high_confidence, ingredientId])
      return `Copied data for ingredient ${ingredientId} from ingredient ${refIngredient.ingredient_id}`  
    }
  }
  await addTranslatedName(ingredientId)
  await addFoodData(ingredientId)
  return `Brand new data for ${ingredientId} from APIs`  
}