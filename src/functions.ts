import { Recipe } from "./types";

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
        )
    }
    return newrecipe
}