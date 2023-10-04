import { logger } from './logger'
import { insertRecipe, insertRecipeSchema, pool, selectIngredient, selectRecipe, test_ } from './db'
import { sanitizeRecipe, sanitizeRecipeSchema } from './functions'
import { type Recipe, type RecipeSchema, isRecipe } from './types'
import { parseRecipeFromPage } from './recipe_parser'

export function home (_: any, res: any): void {
  res.render('home.hbs', { message: 'This was compiled on-site!' })
  logger.log({
    level: 'info',
    message: 'Home loaded'
  })
}

export function options (req: any, res: any): void {
  logger.log({
    level: 'info',
    message: 'Options queried'
  })
}

export async function getAllRecipes (req: any, res: any): Promise<void> {
  res.header('Access-Control-Allow-Origin', '*')
  const allRecipeIds = await pool.query('SELECT recipe_id FROM recipe')
  const userId = ('user' in req && req.user !== undefined && 'id' in req.user && req.user.id !== undefined) ? req.user.id : null
  const recipes = (await Promise.all(allRecipeIds.rows.map(async (id) => { return await selectRecipe(id.recipe_id, userId) })))
    .filter((elt) => {return !('error' in elt)})
  res.status(200).json({ recipes })
}

export async function getRecipe (req: any, res: any): Promise<void> {
  res.header('Access-Control-Allow-Origin', '*')
  try {
    const userId = ('user' in req && req.user !== undefined && 'id' in req.user && req.user.id !== undefined) ? req.user.id : null
    const recipe = await selectRecipe(req.params.recipeId, userId)
    if ('error' in recipe) {
      throw Error('Access not allowed to user')
    }
    res.status(200).json(recipe)
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: `Could not get recipe ${req.params.recipeId}\nError: ${e}`
    })
    res.status(500).json({ error: 'Could not get desired recipe' })
  }
}

export async function newRecipe (req: any, res: any): Promise<void> {
  res.header('Access-Control-Allow-Origin', '*')
  try {
    const recipe: Recipe = req.body
    if (isRecipe(recipe)) {
      logger.log({
        level: 'info',
        message: `New recipe ${recipe.name} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
      })
      void insertRecipe(sanitizeRecipe(recipe))
      res.status(200).json(recipe)
    } else {
      logger.log({
        level: 'error',
        message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
      })
      res.status(500)
      throw TypeError('Request body not of the Recipe type')
    }
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: 'Could not read request body in newRecipe.'
    })
    res.status(500).json({ error: 'no' })
  }
}

export async function getAllIngredients (req: any, res: any): Promise<void> {
  const allIngredientIds = await pool.query(`SELECT ingredient_id FROM ${test_}ingredient`)
  const ingredients = await Promise.all(allIngredientIds.rows.map(async (id) => {
    return await selectIngredient(id.ingredient_id)
  }))
  res.status(200).json({ ingredients })
}

export async function parseRecipe (req: any, res: any): Promise<void> {
  let userId = null
  if ('user' in req && req.user !== undefined && 'id' in req.user && req.user.id !== undefined) {userId = req.user.id}
  try {
    const url = req.body.url
    fetch(url)
      .then(async (response) => {
        return await response.text()
      })
      .then(async (response) => {
        let recipe: RecipeSchema = parseRecipeFromPage(response)
        recipe.url = url
        logger.log({
          level: 'info',
          message: `New recipe ${recipe.name} detected from ${url}!`
        })
        recipe = sanitizeRecipeSchema(recipe)
        return await insertRecipeSchema(recipe, userId)
      })
      .then(async (insertionId) => {
        if (insertionId !== undefined) {
          return await selectRecipe(insertionId, userId, true)
        } else throw Error('New recipe insertion failed')
      })
      .then((recipe) => {
        res.status(200).json(recipe)
      })
      .catch((err) => {
        logger.log({
          level: 'error',
          message: `Recipe parsing failed from ${url}. Error:\n${err}`
        })
        res.status(500).json({ error: 'failure' })
      })
    // insertRecipe(sanitizeRecipe(recipe))
    // res.status(200).json(recipe);
  } catch (e: any) {
    logger.log({
      level: 'error',
      message: 'Could not scrape recipe.'
    })
    res.status(500).json({ error: 'no' })
  }
}
