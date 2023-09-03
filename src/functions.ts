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

const authKey = process.env.DEEPL_KEY || "no_key"
const translator = new deepl.Translator(authKey);

export async function translateIngredient(name: string) {
    const result = await translator.translateText(name, "fr", 'en-US')
    return result.text
}