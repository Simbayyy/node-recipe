import { logger } from "./logger";
import { parse_recipe_from_page } from "./recipe_parser";
import { Ingredient, Recipe, RecipeSchema } from "./types";
import * as deepl from 'deepl-node'
import * as he from 'he'

export function sanitizeRecipe(recipe: Recipe): Recipe {
    let newrecipe: Recipe = {
        ...recipe,
        ingredients: recipe.ingredients.filter((value, index, self) =>
            // Remove ingredients with duplicate names
            index === self.findIndex((t) => (
                t.name === value.name
            ))
        ).map(lintIngredient).sort(sortIngredients),
    }
    return newrecipe
}

export function sanitizeRecipeSchema(recipe: RecipeSchema): RecipeSchema {
    let newrecipe: RecipeSchema = {
        ...recipe,
        recipeInstructions: "recipeInstructions" in recipe && Array.isArray(recipe.recipeInstructions) 
            ? recipe.recipeInstructions.map((elt) => {
                let instruction: string
                if (typeof elt === 'string') {
                    instruction =  elt
                } else {
                    instruction = ('text' in elt && elt.text as string) || ('name' in elt && elt.name as string) || ""
                }
                return he.decode(instruction)
            }).join("\n")
            : [recipe.recipeInstructions as string] || [""],
        recipeCuisine: "recipeCuisine" in recipe && Array.isArray(recipe.recipeCuisine)
            ? he.decode(recipe.recipeCuisine.join(' ; '))
            : he.decode(recipe.recipeCuisine as string || ""),
        recipeYield: "recipeYield" in recipe && Array.isArray(recipe.recipeYield)
            ? he.decode(recipe.recipeYield.join(' ; '))
            : he.decode(recipe.recipeYield as string || ""),
        recipeCategory: "recipeCategory" in recipe && Array.isArray(recipe.recipeCategory)
            ? he.decode(recipe.recipeCategory.join(' ; '))
            : he.decode(recipe.recipeCategory as string || "")
    }
    return newrecipe
}

export function sortIngredients (a:Ingredient ,b:Ingredient) {
    return a.name > b.name ? -1 : 1
}

export function lintIngredient(ingredient: Ingredient): Ingredient {
    let newingredient: Ingredient = {
        name: ingredient.name
            .replace(/\(.*/,"")
            .toLowerCase()
            .replace(/^ ?(du|les?|la|des?) /, "")
            .replace(/^ ?(d|l|s)'/, "")
            .replace(/^ /, "")
            .replace(/ $/, "")
            ,
        amount: Math.trunc(ingredient.amount),
        unit: ingredient.unit,
        name_en: ingredient.name_en ?? undefined,
        fdc_id: ingredient.fdc_id ?? undefined,
        high_confidence: ingredient.high_confidence ?? undefined
    }
    return newingredient
}

// Setup DeepL API access
const authKey = process.env.DEEPL_KEY || "no_key"
const translator = new deepl.Translator(authKey);

export async function translateIngredient(name: string) {
    const result = await translator.translateText(name, "fr", 'en-US')
    return result.text
}

// Setup FoodData Central access
export async function getFoodData (name: string) {
    let response: any = {status:"Looking for ID", error:"", query:'strict'};
    let dataTypes = ["Foundation" ,"Survey (FNDDS)", "SR Legacy"]
    
    for (let query of [`+${name}`.replace(/ /, " +"),name])
    {   
        for (let dataType of dataTypes)
            if (response.status == "Looking for ID"){
                let body = {
                    query: query,
                    dataType:[
                        dataType,
                    ],
                    pageSize:1,
                    pageNumber:1
                }
                let request = {
                    headers: {
                        "Content-Type":"application/json",
                        "X-Api-Key": process.env.FOOD_DATA_KEY || "no_key"
                    },
                    method:'POST',
                    body:JSON.stringify(body)
                }
                let url = "https://api.nal.usda.gov/fdc/v1/foods/search"
                await fetch(url, request).then((res) => {return res.json()}).then((res)=>{
                    logger.log({level:"info",message:`Found id for ${name} in ${dataType}, ${response.query}: ${res.foods[0].fdcId}`})
                    response = res
                }).catch((e) => {
                    response.error += `Could not find ID in ${dataType}\n`
                })
                if (query == name) {
                    response.query = 'loose'
                } else {
                    response.query = 'strict'
                }    
            }
        }
    return response
}

export function get_schema_from_url(url:string) {
    let schema = fetch(url)
        .then((response) => {
            return response.text()
        })
        .then((response) => {
            return parse_recipe_from_page(response) 
        })
        .catch((err) => {
            logger.log({
                level:'error',
                message:`Could not get schema from URL ${url}. Error:\n${err}`
            })
        })
    return schema
}
