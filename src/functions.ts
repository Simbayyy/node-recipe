import { logger } from './logger'
import { type Ingredient, type Recipe, type RecipeSchema } from './types'
import * as deepl from 'deepl-node'
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
    recipeInstructions: 'recipeInstructions' in recipe && Array.isArray(recipe.recipeInstructions)
      ? recipe.recipeInstructions.map((elt) => {
        let instruction: string
        if (typeof elt === 'string') {
          instruction = elt
        } else {
          instruction = ('text' in elt && elt.text !== '' && elt.text as string) || ('name' in elt && elt.name !== '' && elt.name as string) || ''
        }
        return he.decode(String(instruction))
      }).join('\n')
      : recipe.recipeInstructions ?? "",
    recipeCuisine: 'recipeCuisine' in recipe && Array.isArray(recipe.recipeCuisine)
      ? he.decode(String(recipe.recipeCuisine.join(' ; ')))
      : he.decode(String(recipe.recipeCuisine ?? '')),
    recipeYield: 'recipeYield' in recipe && Array.isArray(recipe.recipeYield)
      ? he.decode(String(recipe.recipeYield.join(' ; ')))
      : he.decode(String(recipe.recipeYield ?? '')),
    recipeCategory: 'recipeCategory' in recipe && Array.isArray(recipe.recipeCategory)
      ? he.decode(String(recipe.recipeCategory.join(' ; ')))
      : he.decode(String(recipe.recipeCategory ?? '')),
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

// Setup DeepL API access
const authKey = process.env.DEEPL_KEY ?? 'no_key'
const translator = new deepl.Translator(authKey)

export async function translateIngredient (name: string): Promise<string> {
  const result = await translator.translateText(name, 'fr', 'en-US')
  return result.text
}

// Setup FoodData Central access
export async function getFoodData (name: string): Promise<any> {
  let response: any = { status: 'Looking for ID', error: '', query: 'strict' }
  const dataTypes = ['Foundation', 'Survey (FNDDS)', 'SR Legacy']

  for (const query of [`+${name}`.replace(/ /, ' +'), name]) {
    for (const dataType of dataTypes) {
      if (response.status === 'Looking for ID') {
        const body = {
          query,
          dataType: [
            dataType
          ],
          pageSize: 1,
          pageNumber: 1
        }
        const request = {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.FOOD_DATA_KEY ?? 'no_key'
          },
          method: 'POST',
          body: JSON.stringify(body)
        }
        const url = 'https://api.nal.usda.gov/fdc/v1/foods/search'
        await fetch(url, request).then(async (res) => { return await res.json() }).then((res) => {
          logger.log({ level: 'info', message: `Found id for ${name} in ${dataType}, ${response.query}: ${res.foods[0].fdcId}` })
          response = res
        }).catch((e: any) => {
          response.error += `Could not find ID in ${dataType}\n`
        })
        if (query === name) {
          response.query = 'loose'
        } else {
          response.query = 'strict'
        }
      }
    }
  }
  return response
}
