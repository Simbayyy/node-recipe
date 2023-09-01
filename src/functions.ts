import { Ingredient, Recipe } from "./types";

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
        ).map(lintIngredient)
    }
    return newrecipe
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
        unit: ingredient.unit
    }
    return newingredient
}