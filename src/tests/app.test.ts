import { expect, test, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import {app} from '../app'
import { Recipe, isRecipe } from '../types'
import {pool, insertRecipeSchema, addTranslatedName, selectIngredient} from '../db' 
import { getFoodData, lintIngredient, sanitizeRecipe, translateIngredient } from '../functions'
import { dummyNotRecipe, dummyRecipe, dummyRecipe2, dummyResponse, dummyResponseIngredient } from './dummy_values'

beforeAll(async () => {
    if (process.env.DB_ENV == 'test') {
        // Create test tables
        await pool.query("CREATE TABLE test_recipe (\
            recipe_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(500),\
            url VARCHAR(500) UNIQUE,\
            prepTime VARCHAR(20),\
            cookTime VARCHAR(20),\
            totalTime VARCHAR(20),\
            recipeYield VARCHAR(50),\
            recipeCategory VARCHAR(50),\
            recipeInstructions VARCHAR(1000),\
            recipeCuisine VARCHAR(50)\
            );")
        await pool.query("CREATE TABLE test_ingredient (\
            ingredient_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(200) UNIQUE,\
            name_en VARCHAR(200),\
            fdc_id INT,\
            high_confidence BOOLEAN DEFAULT FALSE\
            );")
        await pool.query("CREATE TABLE test_recipe_ingredient (\
            recipe_id INT,\
            ingredient_id INT,\
            amount INT, \
            unit VARCHAR(100),\
            PRIMARY KEY (recipe_id, ingredient_id),\
            CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES test_recipe(recipe_id),\
            CONSTRAINT fk_ingredient FOREIGN KEY(ingredient_id) REFERENCES test_ingredient(ingredient_id)\
            );")
        await pool.query("CREATE TABLE test_recipe_time (\
            time_id SERIAL NOT NULL PRIMARY KEY,\
            recipe_id INT,\
            time INT, \
            unit VARCHAR(100),\
            CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES test_recipe(recipe_id)\
            );")
        await insertRecipeSchema(dummyRecipe)
    }
})

afterAll(async () => {
    if (process.env.DB_ENV == 'test') {
        // Cleanup created db tables
        await pool.query("DROP TABLE IF EXISTS test_recipe, test_ingredient, test_recipe_ingredient, test_recipe_time")
    }
})

test('getFoodData', async () => {
    if (process.env.DB_ENV == 'test') {
        let breadId = await getFoodData('bread')
        expect(breadId.foods[0].fdcId).toEqual(325871)
        let noId = await getFoodData('noID')
        expect(noId).toHaveProperty('error')
    }
})

test('GET /api/recipes/recipeId', async () => {
    if (process.env.DB_ENV == 'test') {
        const response = await request(app)
            .get('/api/recipes/1')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
        expect(response.status).toEqual(200)
        expect(response.body).toStrictEqual(dummyResponse)
        const response2 = await request(app)
            .get('/api/recipes/10')
            .set('Accept', 'application/json')
        expect(response2.status).toEqual(500)
    } else {
        return true
    }
})

test('selectIngredient', async () => {
    if (process.env.DB_ENV == 'test') {
        const response = await selectIngredient(1)
        expect(response).toStrictEqual(dummyResponseIngredient)
    } else {
        return true
    }
})

test('Database entry creation', async () => {
    if (process.env.DB_ENV == 'test') {
        let insert_dummy_2 = await insertRecipeSchema(dummyRecipe)
        expect(insert_dummy_2).toBe(undefined)
        let insert_dummy_3 = await insertRecipeSchema(dummyNotRecipe)
        expect(insert_dummy_3).toBe(undefined)
        let insert_dummy_4 = await insertRecipeSchema({})
        expect(insert_dummy_4).toBe(undefined)
        let insert_dummy_5 = await insertRecipeSchema(dummyRecipe2)
        expect(insert_dummy_5?.rows[0].recipe_id).toBe(3)
    }
})


test('Database structure', async () => {
    if (process.env.DB_ENV == 'test') {
        let are_tables_created = await pool.query("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'public';")
        expect(are_tables_created.rows).toEqual(expect.arrayContaining([
            {table_name: 'test_recipe'},
            {table_name: 'test_ingredient'},
            {table_name: 'test_recipe_ingredient'},
        ]))
    } else {
        return true
    }
})

test('lintIngredients', () => {
    expect(lintIngredient({ name: "Tomatoes", amount: 3.3, unit: "cups" }))
        .toStrictEqual({ name: "tomatoes", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
    expect(lintIngredient({ name: " Onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
    expect(lintIngredient({ name: "Bell Peppers (Red)", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "bell peppers", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
    expect(lintIngredient({ name: "Les onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
    expect(lintIngredient({ name: "D'Onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
    expect(lintIngredient({ name: "", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "", amount: 3, unit: "cups", name_en:undefined, fdc_id:undefined, high_confidence:undefined })
})
