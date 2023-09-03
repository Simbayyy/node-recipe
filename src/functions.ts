import { logger } from "./logger";
import { Ingredient, Recipe } from "./types";
import * as deepl from 'deepl-node'

export function sanitizeRecipe(recipe: Recipe): Recipe {
    let newrecipe: Recipe = {
        name: recipe.name,
        url: recipe.url,
        time: recipe.time,
        ingredients: recipe.ingredients.filter((value, index, self) =>
            // Remove ingredients with duplicate names
            index === self.findIndex((t) => (
                t.name === value.name
            ))
        ).map(lintIngredient).sort(sortIngredients)
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
        amount: ingredient.amount,
        unit: ingredient.unit,
        name_en: ingredient.name_en ? ingredient.name_en : undefined
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
            }
            if (query == name) {
                response.query = 'loose'
            } else {
                response.query = 'strict'
            }
        }
    return response
}