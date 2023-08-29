import * as app from './app'
import {Recipe, isRecipe} from './types'

export function home (_: any, res: any) {
  res.render('home.hbs')
  app.logger.log({
    level: 'info',
    message: `Home loaded`
  });
}

export function newRecipe (req:any, res:any) {
  try {
    const recipe: Recipe = req.body
    if (isRecipe(recipe)){
        app.logger.log({
          level: 'info',
          message: `New recipe ${recipe.title} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
        });  
        res.status(200).json(recipe);
    } else {
      app.logger.log({
        level: 'error',
        message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
      });    
      throw TypeError("Request body not of the Recipe type")
    }
  }
  catch {
    app.logger.log({
      level: 'error',
      message: `Could not read request body in newRecipe`
    });
    throw TypeError("Request body not readable")
  } 
}