import { expect, test, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import {extract_schema, page_text_to_html, parse_recipe_from_page, parse_recipe_ingredient} from '../recipe_parser'
import { dummyIngredients, dummyIngredientsResponse, dummyLDJSON, dummyPage } from './dummy_values'


test('parse ld-json script', () => {
    expect(parse_recipe_from_page(dummyPage)).toStrictEqual(dummyLDJSON)
})

test('parse ingredient', () => {
    expect(parse_recipe_ingredient(dummyIngredients)).toStrictEqual(dummyIngredientsResponse)
})