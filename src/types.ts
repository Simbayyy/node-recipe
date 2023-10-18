import { sortIngredients } from "./functions"

export interface Time {
  time: number
  unit: string
}

export interface Ingredient {
  name: string
  amount: number
  unit: string
  short_name?: string
  name_en?: string
  fdc_id?: number
  high_confidence?: boolean
  energy?: number
  calcium?: number
  sodium?: number
  carbohydrates?: number
  fiber?: number
  iron?: number
  lipid?: number
  magnesium?: number
  protein?: number
  zinc?: number
}

export interface IngredientRaw {
  ingredient_id: number
  name: string
  name_en: string
  fdc_id: number
  high_confidence: boolean
}

export interface Recipe {
  name: string
  url: string
  time: Time
  ingredients: Ingredient[]
  id?: number
}

export interface RecipeSchema {
  name: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  recipeInstructions?: string | string[] | object[]
  recipeYield?: string | string[]
  recipeCategory?: string | string[]
  recipeCuisine?: string | string[]
  url?: string
  recipeIngredient?: string[] | Ingredient[]
  id?: number
  originalId?:number
}

export const RecipeSchemaKeys = ['name',
  'prepTime',
  'cookTime',
  'totalTime',
  'recipeInstructions',
  'recipeYield',
  'recipeCategory',
  'recipeCuisine',
  'url',
  'recipeIngredient'
]

export function isRecipe (recipe: Recipe | object): recipe is Recipe {
  const recipeAs = recipe as Recipe
  return ((recipeAs.name !== undefined) && (typeof (recipeAs.name) === 'string') &&
            (recipeAs.url !== undefined) && (typeof (recipeAs.url) === 'string') &&
            (recipeAs.time !== undefined) &&
            (recipeAs.ingredients !== undefined) &&
            (isTime(recipeAs.time)) &&
            (areIngredients(recipeAs.ingredients))
  )
}

function isTime (time: Time | object): time is Time {
  const timeAs = time as Time
  return ((timeAs.time !== undefined) && (typeof (timeAs.time) === 'number') &&
            (timeAs.unit !== undefined) && (typeof (timeAs.unit) === 'string')
  )
}

function areIngredients (ingredients: Ingredient[] | object[]): boolean {
  function isIngredient (ingredient: Ingredient | object): ingredient is Ingredient {
    const ingredientAs = ingredient as Ingredient
    return ((ingredientAs.name !== undefined) && (typeof (ingredientAs.name) === 'string') &&
                (ingredientAs.amount !== undefined) && (typeof (ingredientAs.amount) === 'number') &&
                (ingredientAs.unit !== undefined)) && (typeof (ingredientAs.unit) === 'string')
  }

  let allingredients = true
  ingredients.forEach((ingredient) => {
    if (allingredients) { allingredients = isIngredient(ingredient) }
  })
  return allingredients
}
export function isIngredientNonNull (elt) {
  return elt.amount !== 0 && elt.name !== ""
}

export function areSameIngredients (ingredients1: Ingredient[], ingredients2: Ingredient[]) {
  const ingredients1Order = ingredients1.sort(sortIngredients).filter(isIngredientNonNull)
  const ingredients2Order = ingredients2.sort(sortIngredients).filter(isIngredientNonNull)
  if (ingredients1Order.length === ingredients2Order.length) {
    const sameArray = ingredients1Order.map((ingredient, index) => {
      const ingredient2 = ingredients2Order[index]
      if (ingredient.name === ingredient2.name
          && ingredient.amount === ingredient2.amount
          && ingredient.unit === ingredient2.unit) {
            return true
      } else {
        return false
      }
    })
    return !sameArray.some((isSame) => isSame === false)
  } else {
    return false
  }
}