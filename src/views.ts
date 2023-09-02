import * as app from './app'
import { insertRecipe, selectRecipe } from './db';
import { sanitizeRecipe } from './functions';
import {Recipe, isRecipe} from './types'

export function home (_: any, res: any) {
  res.render('home.hbs')
  app.logger.log({
    level: 'info',
    message: `Home loaded`
  });
}

export function options (req:any, res:any) {
  app.logger.log({
    level: 'info',
    message: `Options queried`
  });  
}

export async function getRecipe (req:any, res:any) {
  try {
    let recipe = await selectRecipe(req.params.recipeId)
    if (isRecipe(recipe)) {
      res.status(200).json(recipe)
    } else {
      throw Error('Selected object is not a recipe')
    }
  }
  catch (e) {
    app.logger.log({
      level:'error',
      message:`Could not get recipe ${req.params.recipeId}\nError: ${e}`
    })
    res.status(500).json({error:"Could not get desired recipe"})
  }

}

export function newRecipe (req:any, res:any) {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    const recipe: Recipe = req.body
    if (isRecipe(recipe)){
        app.logger.log({
          level: 'info',
          message: `New recipe ${recipe.name} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
        });
        insertRecipe(sanitizeRecipe(recipe))
        res.status(200).json(recipe);
    } else {
      app.logger.log({
        level: 'error',
        message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
      });    
      res.status(500)
      throw TypeError("Request body not of the Recipe type")
    }
  }
  catch (e) {
    app.logger.log({
      level: 'error',
      message: `Could not read request body in newRecipe.`
    });
    res.status(500).json({error:"no"})
  } 
}