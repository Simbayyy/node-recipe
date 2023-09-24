import * as cheerio from 'cheerio'
import { RecipeSchema, RecipeSchemaKeys } from './types'

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
        console.log(recipe_json.keys)
        if (keyName in recipe_json) {
            recipe[RecipeSchemaKeys[key]] = recipe_json[keyName]
        }
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