import * as cheerio from 'cheerio'
import * as he from 'he'
import { Ingredient, RecipeSchema, RecipeSchemaKeys } from './types'

export function page_text_to_html(page:string):cheerio.CheerioAPI {
    const html = cheerio.load(page)
    return html
}

export function extract_schema(html:cheerio.CheerioAPI):object {
    let ldjson: object | null = null
    let script = html('[type="application/ld+json"]')
    script.each((index, elt) => {
        let newldjson = JSON.parse(html( elt ).html() || "{}")
        if ((!ldjson) && ("@type" in newldjson) && (newldjson["@type"] == 'Recipe')) {
            ldjson = newldjson
        }
    })

    return ldjson || {}
}

export function parse_recipe_schema(recipe_json:any) {
    let recipe:any = {}
    for (let key in RecipeSchemaKeys) {
        let keyName = RecipeSchemaKeys[key]
        if (keyName in recipe_json) {
            recipe[RecipeSchemaKeys[key]] = recipe_json[keyName]
        }
    }
    if ('recipeIngredient' in recipe) {
        recipe.recipeIngredient = parse_recipe_ingredient(recipe.recipeIngredient)
    }
    return recipe
}

export function parse_recipe_from_page(page:string):RecipeSchema {
    return parse_recipe_schema(
        extract_schema(
            page_text_to_html(
                page
            )
        )
    )
}

export function parse_recipe_ingredient(recipeIngredient: string[]) {
    return recipeIngredient.map((ingredient) => {
        let parsed_ingredient: Ingredient = {
            name: '',
            amount: 0,
            unit: ''
        }
        let amount = ingredient.match(/^((?<fraction>\d+ \d\/[1-9])|(?<division>\d\/[1-9])|(?<decimal>\d+[\.,]\d+)|(?<range>\d+\-\d+)|(?<either>\d+ (or|ou|à|to) \d+)|(?<number>\d+(?! ?\d?\/))|(?<nothing>(?!\d)))(?<rest>.*)/)
        if ((amount) && ('groups' in amount) && (amount.groups != undefined)) {
            if (amount.groups.fraction) {
                let parts = amount.groups.fraction.split(" ")
                let fraction = parts[1].split('/')
                parsed_ingredient.amount = Number(parts[0]) 
                    + Math.floor(Number(fraction[0])/Number(fraction[1]) * 100)/100
            } else if ((amount.groups.range) || (amount.groups.either)) {
                let parts = (amount.groups.range || amount.groups.either).match(/\d+/g)
                parsed_ingredient.amount = (Number(parts![0] || 0) + Number(parts![1] || 0)) / 2
            } else if (amount.groups.division) {
                let parts = amount.groups.division.split(/\//)
                parsed_ingredient.amount = Math.floor(
                    Number(parts[0])
                    / Number(parts[1]) 
                    * 100) / 100
            } else if (amount.groups.decimal) {
                parsed_ingredient.amount = Number(amount.groups.decimal.replace(',','.'))
            } else if (amount.groups.number) {
                parsed_ingredient.amount = Number(amount.groups.number)
            }

            if (amount.groups.rest) {
                const UNITS: RegExp = /(?<!\w)(?<unit>[mkc]?[gl]|cs|cc|c\.à\.s\.?|c\.à\.c\.?|cuill(?:e|è)re?s? à (?:café|soupe)|verres?|gousses?|poignées?|bouts?|tasses?|coupes?|pincées?|morceaux?|quartiers?|cups?) (?<rest>.*)/i

                let unit = amount.groups.rest.match(UNITS)
                if ((unit) && ('groups' in unit) && (unit.groups != undefined) && (unit.groups.unit)) {
                    parsed_ingredient.unit = unit.groups.unit
                    if (unit.groups.rest) {
                        parsed_ingredient.name = unit.groups.rest
                    }
                }

                if (parsed_ingredient.name == '') {
                    parsed_ingredient.name = amount.groups.rest
                }
            }

            parsed_ingredient = sanitizeIngredient(parsed_ingredient)
        }

        return parsed_ingredient 
    })
}

function sanitizeIngredient(parsed_ingredient: Ingredient): Ingredient {
    try {
        let new_ingredient: Ingredient = {
            name: he.decode(String(parsed_ingredient.name)
                .toLowerCase()
                .trim()
                .replace(/^(des?|du|of)(?= )/, "")
                .trim()
                .replace(/^(la|les?)(?= )/, "")
                .trim()
                .replace(/^[dsl]\'/, "")
                .replace(/\(.*\)/, "")
                .trim())
                ,
            amount: parsed_ingredient.amount,
            unit: parsed_ingredient.unit
                .replace(/cuill(?:e|è)re?s? à café/, "cc")
                .replace(/cuill(?:e|è)re?s? à soupe/, "cs")
                .replace(/c\.à\.c\.?/, "cc")
                .replace(/c\.à\.s\.?/, "cs")
        }
        return new_ingredient
    } catch (err) {
        throw Error(`Could not sanitize ingredient ${JSON.stringify(parsed_ingredient)}. Error:\n${err}`)
    }
}
