export interface Time {
    time: Number,
    unit: string
}

export interface Ingredient {
    name: string,
    amount: number,
    unit:string,
    name_en?: string,
    fdc_id?:number,
    high_confidence?:boolean
}

export interface Recipe {
    name: string,
    url: string,
    time: Time,
    ingredients: Ingredient[]
}

export function isRecipe(recipe: Recipe | object): recipe is Recipe {
    const recipeAs = recipe as Recipe
    return ((recipeAs.name !== undefined) && (typeof(recipeAs.name) == 'string')
            && (recipeAs.url !== undefined) && (typeof(recipeAs.url) == 'string')
            && (recipeAs.time !== undefined) 
            && (recipeAs.ingredients !== undefined)
            && (isTime(recipeAs.time))
            && (areIngredients(recipeAs.ingredients))
    )
}

function isTime(time: Time | object): time is Time {
    const timeAs = time as Time
    return ((timeAs.time !== undefined) && (typeof(timeAs.time) == 'number')
            && (timeAs.unit !== undefined) && (typeof(timeAs.unit) == 'string')
    )
}

function areIngredients(ingredients: Ingredient[] | object[]): boolean {
    function isIngredient(ingredient: Ingredient | object): ingredient is Ingredient {
        const ingredientAs = ingredient as Ingredient
        return ((ingredientAs.name !== undefined) && (typeof(ingredientAs.name) == 'string')
                && (ingredientAs.amount !== undefined) && (typeof(ingredientAs.amount) == 'number')
                && (ingredientAs.unit !== undefined)) && (typeof(ingredientAs.unit) == 'string')
    }

    let allingredients = true
    ingredients.forEach((ingredient) => {
        allingredients ? allingredients = isIngredient(ingredient) : 0
    })
    return allingredients
}