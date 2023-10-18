import { insertRecipeSchema, removeRecipeUserLink, selectRecipe } from "./db";
import { logger } from "./logger";
import { sanitizeIngredient } from "./recipe_parser";
import { Ingredient, RecipeSchema, areSameIngredients, isIngredientNonNull } from "./types";


export async function storeEditedRecipe(newRecipe: RecipeSchema, userId: number) {
    try {
        if (!('id' in newRecipe && newRecipe.id !== undefined)) {
            throw TypeError(`Recipe has no id`)
        }
        newRecipe.recipeIngredient = (newRecipe.recipeIngredient as Ingredient[])
            .filter(isIngredientNonNull)
            .map(sanitizeIngredient)
        if (newRecipe.id === 0){
            const addRecipeId = await insertRecipeSchema(newRecipe, userId)
            logger.info(`Stored recipe ${addRecipeId} as a new recipe`)
            return addRecipeId
        } else {
            const oldRecipe = await selectRecipe(newRecipe.id, userId)
            newRecipe.originalId = newRecipe.id
            if (!('error' in oldRecipe)) {
                if (!areSameIngredients(oldRecipe.recipeIngredient as Ingredient[],newRecipe.recipeIngredient as Ingredient[])) {
                    const addRecipeId = await insertRecipeSchema(newRecipe, userId)
                    const removeOldUserRecipeLink = await removeRecipeUserLink(newRecipe.id || null, userId)
                    logger.info(`Stored recipe ${addRecipeId} as an edited copy of recipe ${newRecipe.id }`)
                    return addRecipeId
                } else {
                    throw Error(`No difference between the recipes' ingredients`)
                }
            } else {
                throw Error(`Could not find original recipe`)
            }
        }
        
    } catch (err) {
        logger.error(`Could not store the edited recipe.\nError:${err}`)
    }
    return undefined
}