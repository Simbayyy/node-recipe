"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRecipe = void 0;
function sanitizeRecipe(recipe) {
    let newrecipe = {
        name: recipe.name,
        url: recipe.url,
        time: recipe.time,
        ingredients: recipe.ingredients.filter((value, index, self) => 
        // Remove ingredients with duplicate names
        index === self.findIndex((t) => (t.name === value.name)))
    };
    return newrecipe;
}
exports.sanitizeRecipe = sanitizeRecipe;
