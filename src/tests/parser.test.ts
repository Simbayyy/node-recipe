import { expect, test, afterAll, beforeAll } from 'vitest'
import {parseRecipeFromPage, parseRecipeIngredient} from '../recipe_parser'
import { dummyIngredients, dummyIngredientsResponse, dummyLDJSON, dummyPage } from './dummy_values'


test('parse ld-json script', () => {
    expect(parseRecipeFromPage(dummyPage)).toStrictEqual(dummyLDJSON)
})

test('parse ingredient', () => {
    expect(parseRecipeIngredient(dummyIngredients)).toStrictEqual(dummyIngredientsResponse)
    expect(parseRecipeIngredient(["1 tasse de lait(s) froid"]))
        .toStrictEqual([{
            amount: 1,
            unit:'tasse',
            name:"lait froid"
        }])
})