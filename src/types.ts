export interface Time {
    time: Number,
    unit: string
}

export interface Ingredient {
    name: string,
    amount: Number,
    unit:string
}

export interface Recipe {
    name: string,
    url: string,
    time: Time,
    ingredients: Ingredient[]
}