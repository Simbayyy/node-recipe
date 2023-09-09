import * as app from './app'
import { logger } from './logger';
import { insertRecipe, pool, selectRecipe } from './db';
import { sanitizeRecipe } from './functions';
import {Recipe, isRecipe} from './types'

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