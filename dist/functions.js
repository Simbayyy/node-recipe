"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintIngredient = exports.sanitizeRecipe = void 0;
function sanitizeRecipe(recipe) {
    let newrecipe = {
        name: recipe.name,
        url: recipe.url,
        time: recipe.time,
        ingredients: recipe.ingredients.filter((value, index, self) => 
        // Remove ingredients with duplicate names
        index === self.findIndex((t) => (t.name === value.name))).map(lintIngredient)
    };
    return newrecipe;
}
exports.sanitizeRecipe = sanitizeRecipe;
function lintIngredient(ingredient) {
    let newingredient = {
        name: ingredient.name
            .replace(/\(.*/, "")
            .toLowerCase()
            .replace(/^ ?(du|les?|la|des?) /, "")
            .replace(/^ ?(d|l|s)'/, "")
            .replace(/^ /, "")
            .replace(/ $/, ""),
        amount: ingredient.amount,
        unit: ingredient.unit
    };
    return newingredient;
}
exports.lintIngredient = lintIngredient;
