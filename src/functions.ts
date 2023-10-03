import { type Ingredient, type Recipe, type RecipeSchema } from './types'
import * as he from 'he'

export function sanitizeRecipe (recipe: Recipe): Recipe {
  const newrecipe: Recipe = {
    ...recipe,
    ingredients: recipe.ingredients.filter((value, index, self) =>
    // Remove ingredients with duplicate names
      index === self.findIndex((t) => (
        t.name === value.name
      ))
    ).map(lintIngredient).sort(sortIngredients)
  }
  return newrecipe
}

export function sanitizeRecipeSchema (recipe: RecipeSchema): RecipeSchema {
  const newrecipe: RecipeSchema = {
    ...recipe,
    recipeInstructions: ('recipeInstructions' in recipe && Array.isArray(recipe.recipeInstructions)
      ? recipe.recipeInstructions.map((elt) => {
        let instruction: string
        if (typeof elt === 'string') {
          instruction = elt
        } else {
          instruction = ('text' in elt && elt.text !== '' && elt.text as string) || ('name' in elt && elt.name !== '' && elt.name as string) || ''
        }
        return he.decode(String(instruction))
      }).join('\n')
      : recipe.recipeInstructions ?? "").slice(0,1000),
    recipeCuisine: ('recipeCuisine' in recipe && Array.isArray(recipe.recipeCuisine)
      ? he.decode(String(recipe.recipeCuisine.join(' ; ')))
      : he.decode(String(recipe.recipeCuisine ?? ''))).slice(0,500),
    recipeYield: ('recipeYield' in recipe && Array.isArray(recipe.recipeYield)
      ? he.decode(String(recipe.recipeYield.join(' ; ')))
      : he.decode(String(recipe.recipeYield ?? ''))).slice(0,500),
    recipeCategory: ('recipeCategory' in recipe && Array.isArray(recipe.recipeCategory)
      ? he.decode(String(recipe.recipeCategory.join(' ; ')))
      : he.decode(String(recipe.recipeCategory ?? ''))).slice(0,500),
    recipeIngredient: recipe.recipeIngredient?.sort((a, b) => {
      if (typeof a === 'string') {
        return a < b ? 1 : -1
      } else {
        return a.name < b.name ? 1 : -1
      }
    })
  }
  return newrecipe
}

export function sortIngredients (a: Ingredient, b: Ingredient): number {
  return a.name > b.name ? -1 : 1
}

export function lintIngredient (ingredient: Ingredient): Ingredient {
  const newingredient: Ingredient = {
    name: ingredient.name
      .replace(/\(.*/, '')
      .toLowerCase()
      .replace(/^ ?(du|les?|la|des?) /, '')
      .replace(/^ ?(d|l|s)'/, '')
      .replace(/^ /, '')
      .replace(/ $/, ''),
    amount: Math.trunc(ingredient.amount),
    unit: ingredient.unit,
    name_en: ingredient.name_en ?? undefined,
    fdc_id: ingredient.fdc_id ?? undefined,
    high_confidence: ingredient.high_confidence ?? undefined
  }
  return newingredient
}
