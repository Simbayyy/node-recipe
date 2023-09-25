import * as app from './app'
import { logger } from './logger';
import { insertRecipe, pool, selectIngredient, selectRecipe, test_ } from './db';
import { sanitizeRecipe, sanitizeRecipeSchema } from './functions';
import {Recipe, RecipeSchema, isRecipe} from './types'
import { parse_recipe_from_page } from './recipe_parser';

export function home (_: any, res: any) {
  res.render('home.hbs', {message:"This was compiled on-site!"})
  logger.log({
    level: 'info',
    message: `Home loaded`
  });
}

export function options (req:any, res:any) {
  logger.log({
    level: 'info',
    message: `Options queried`
  });  
}

export async function getAllRecipes (req:any, res:any) {
  res.header("Access-Control-Allow-Origin", "*");
  let all_recipe_ids = await pool.query('SELECT recipe_id FROM recipe')
  let recipes = await Promise.all(all_recipe_ids.rows.map((id) => {return selectRecipe(id.recipe_id)}))
  let filter_recipes = recipes.filter(isRecipe)  
  res.status(200).json({recipes:filter_recipes})
}

export async function getRecipe (req:any, res:any) {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    let recipe = await selectRecipe(req.params.recipeId)
    if (isRecipe(recipe)) {
      res.status(200).json(recipe)
    } else {
      throw Error(`Selected object is not a recipe: ${JSON.stringify(recipe)}`)
    }
  }
  catch (e) {
    logger.log({
      level:'error',
      message:`Could not get recipe ${req.params.recipeId}\nError: ${e}`
    })
    res.status(500).json({error:"Could not get desired recipe"})
  }

}

export async function newRecipe (req:any, res:any) {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const recipe: Recipe = req.body
    if (isRecipe(recipe)){
        logger.log({
          level: 'info',
          message: `New recipe ${recipe.name} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
        });
        insertRecipe(sanitizeRecipe(recipe))
        res.status(200).json(recipe);
    } else {
      logger.log({
        level: 'error',
        message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
      });    
      res.status(500)
      throw TypeError("Request body not of the Recipe type")
    }
  }
  catch (e) {
    logger.log({
      level: 'error',
      message: `Could not read request body in newRecipe.`
    });
    res.status(500).json({error:"no"})
  }
}

export async function getAllIngredients (req:any, res:any) {

  let all_ingredient_ids = await pool.query(`SELECT ingredient_id FROM ${test_}ingredient`)
  let ingredients = await Promise.all(all_ingredient_ids.rows.map((id) => {
    return selectIngredient(id.ingredient_id)
  }))
  res.status(200).json({ingredients:ingredients})
}

export async function parseRecipe(req:any, res:any,) {
  try {
    const url = req.body.url
    fetch(url)
      .then((response) => {
        return response.text()
      })
      .then((response) => {
        let recipe:RecipeSchema = parse_recipe_from_page(response)
        recipe.url = url
        logger.log({
          level: 'info',
          message: `New recipe ${recipe.name} detected from ${url}!`
        });
        recipe = sanitizeRecipeSchema(recipe)
      })
      .catch((err) => {
        logger.log({
          level: 'error',
          message: `Recipe parsing failed from ${url}. Error:\n${err}`
        });    
        res.status(500).json({error:'failure'})
      })
        //insertRecipe(sanitizeRecipe(recipe))
        //res.status(200).json(recipe);
  }
  catch (e) {
    logger.log({
      level: 'error',
      message: `Could not scrape recipe.`
    });
    res.status(500).json({error:"no"})
  }

}