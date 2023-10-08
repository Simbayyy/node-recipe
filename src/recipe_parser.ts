import * as cheerio from 'cheerio'
import * as he from 'he'
import { type Ingredient, type RecipeSchema, RecipeSchemaKeys } from './types'

export function pageTextToHtml (page: string): cheerio.CheerioAPI {
  const html = cheerio.load(page)
  return html
}

export function extractSchema (html: cheerio.CheerioAPI): object {
  let ldjson: object | null = null
  const script = html('[type="application/ld+json"]')
  script.each((index, elt) => {
    const newldjson = JSON.parse(html(elt).html() ?? '{}')
    if ((ldjson === null) && ('@type' in newldjson) && (newldjson['@type'] === 'Recipe')) {
      ldjson = newldjson as object
    }
  })

  return ldjson ?? {}
}

export function parseRecipeSchema (recipeJson: any): RecipeSchema {
  const recipe: any = {}
  RecipeSchemaKeys.forEach((key) => {
    if (key in recipeJson) {
      recipe[key] = recipeJson[key]
    }
  })
  if ('recipeIngredient' in recipe) {
    recipe.recipeIngredient = parseRecipeIngredient(recipe.recipeIngredient)
  }
  return recipe as RecipeSchema
}

export function parseRecipeFromPage (page: string): RecipeSchema {
  return parseRecipeSchema(
    extractSchema(
      pageTextToHtml(
        page
      )
    )
  )
}

export function parseRecipeIngredient (recipeIngredient: string[]): Ingredient[] {
  return recipeIngredient.map((ingredient) => {
    let parsedIngredient: Ingredient = {
      name: '',
      amount: 0,
      unit: ''
    }
    const ingredientWithoutParenthesis = ingredient.replace(/\([^)]+\)/g, '')
    const amount = ingredientWithoutParenthesis.match(/^((?<fraction>\d+ \d\/[1-9])|(?<division>\d\/[1-9])|(?<decimal>\d+[.,]\d+)|(?<range>\d+-\d+)|(?<either>\d+ (or|ou|à|to) \d+)|(?<number>\d+(?! ?\d?\/))|(?<nothing>(?!\d)))(?<rest>.*)/)
    if ((amount !== null) && ('groups' in amount) && (amount.groups !== undefined)) {
      if (amount.groups.fraction !== undefined) {
        const parts = amount.groups.fraction.split(' ')
        const fraction = parts[1].split('/')
        parsedIngredient.amount = Number(parts[0]) +
                    Math.floor(Number(fraction[0]) / Number(fraction[1]) * 100) / 100
      } else if ((amount.groups.range !== undefined) || (amount.groups.either !== undefined)) {
        const parts = ((amount.groups.range !== '' && amount.groups.range) || (amount.groups.either !== '' && amount.groups.either) || '').match(/\d+/g) as RegExpMatchArray
        parsedIngredient.amount = (Number(parts[0] || '0') + Number(parts[1] || '0')) / 2
      } else if (amount.groups.division !== undefined) {
        const parts = amount.groups.division.split(/\//)
        parsedIngredient.amount = Math.floor(
          Number(parts[0]) /
                    Number(parts[1]) *
                    100) / 100
      } else if (amount.groups.decimal !== undefined) {
        parsedIngredient.amount = Number(amount.groups.decimal.replace(',', '.'))
      } else if (amount.groups.number !== undefined) {
        parsedIngredient.amount = Number(amount.groups.number)
      }

      if (amount.groups.rest !== '') {
        const UNITS: RegExp = /(?<!\w)(?<unit>[mkc]?[gl](?=[ .])|cs|cc|c\.à\.s\.?|c\.à\.c\.?|(cuill(?:e|è)re?s?|c\.?) à (?:café|soupe)|verres?|pièces?|cm|centimètres?|gr|sachets?|gousses?|poignées?|bouts?|tasses?|coupes?|pincées?|tours?|morceaux?|quartiers?|cups?|bottes?|branches?)(\(s\))?[^\w](?<rest>.*)/i

        const unit = amount.groups.rest.match(UNITS)
        if ((unit !== null) && ('groups' in unit) && (unit.groups !== undefined) && (unit.groups.unit !== '')) {
          parsedIngredient.unit = unit.groups.unit
          if (unit.groups.rest !== '') {
            parsedIngredient.name = unit.groups.rest
          }
        }

        if (parsedIngredient.name === '') {
          parsedIngredient.name = amount.groups.rest
        }
      }
      parsedIngredient = sanitizeIngredient(parsedIngredient)
    }
    return parsedIngredient
  })
}

function sanitizeIngredient (parsedIngredient: Ingredient): Ingredient {
  try {
    const newIngredient: Ingredient = {
      name: he.decode(String(parsedIngredient.name))
        .toLowerCase()
        .trim()
        .replace(/^(des?|du|of)(?= )/, '')
        .trim()
        .replace(/^(la|les?)(?= )/, '')
        .trim()
        .replace(/^[dsl]'/g, '')
        .trim(),
      amount: parsedIngredient.amount,
      unit: parsedIngredient.unit
        .replace(/cuill(?:e|è)re?s? à café/, 'cc')
        .replace(/cuill(?:e|è)re?s? à soupe/, 'cs')
        .replace(/c\.à\.c\.?/, 'cc')
        .replace(/c\.à\.s\.?/, 'cs')
        .replace(/^gr(ammes?)?$/, 'g')
    }
    newIngredient.short_name = shortenName(newIngredient.name) 
    return newIngredient
  } catch (err: any) {
    throw Error(`Could not sanitize ingredient ${JSON.stringify(parsedIngredient)}. Error:\n${err}`)
  }
}

export function shortenName(name: string): string {
  const trimRegex = /^((bâtons?|filets?|lamelles?|gros|pavés?|dés?|de|d\'|gousse|fins?|froids?|chauds?|en|et|&|coupée?s?|bâtonnets?|julienne|surgelée?s?|émincée?s?|concassée?s?|tranch[eé]e?s?|battue?s?|neiges?|mixée?s?|marinée?s?|blanchie?s?|pelée?s?|râpée?s?|)\s)*|\s*(\s(fins?|froids?|chauds?|en|et|&|coupée?s?|bâtonnets?|julienne|surgelée?s?|émincée?s?|poudres?|verts?|rouges?|jaunes?|concassée?s?|doux|tranch[eé]e?s?|battue?s?|neiges?|mixée?s?|p(â|a)tissiers?|marinée?s?|blanchie?s?|secs?|séchée?s?|pelée?s?|râpée?s?))+\s*$/g;
  
  return name.replace(trimRegex, '')
}

