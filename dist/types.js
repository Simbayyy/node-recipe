"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecipe = void 0;
function isRecipe(recipe) {
    const recipeAs = recipe;
    return ((recipeAs.title !== undefined) && (typeof (recipeAs.title) == 'string')
        && (recipeAs.url !== undefined) && (typeof (recipeAs.url) == 'string')
        && (recipeAs.time !== undefined)
        && (recipeAs.ingredients !== undefined)
        && (isTime(recipeAs.time))
        && (areIngredients(recipeAs.ingredients)));
}
exports.isRecipe = isRecipe;
function isTime(time) {
    const timeAs = time;
    return ((timeAs.time !== undefined) && (typeof (timeAs.time) == 'number')
        && (timeAs.unit !== undefined) && (typeof (timeAs.unit) == 'string'));
}
function areIngredients(ingredients) {
    function isIngredient(ingredient) {
        const ingredientAs = ingredient;
        return ((ingredientAs.name !== undefined) && (typeof (ingredientAs.name) == 'string')
            && (ingredientAs.amount !== undefined) && (typeof (ingredientAs.amount) == 'number')
            && (ingredientAs.unit !== undefined)) && (typeof (ingredientAs.unit) == 'string');
    }
    let allingredients = true;
    ingredients.forEach((ingredient) => {
        allingredients ? allingredients = isIngredient(ingredient) : 0;
    });
    return allingredients;
}
