import * as app from './app'
import {Recipe} from './types'

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
    app.logger.log({
      level: 'info',
      message: `New recipe ${recipe.name} detected from ${recipe.url}!`
    });  
    res.status(200).json(recipe);
  }
  catch {
    app.logger.log({
      level: 'error',
      message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
    });
    throw TypeError("Request body not of the Recipe type")
  } 
}