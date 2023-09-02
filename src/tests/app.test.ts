import { expect, test, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import {app} from '../app'
import { Recipe, isRecipe } from '../types'
import {pool, insertRecipe} from '../db' 
import { lintIngredient } from '../functions'

beforeAll(async () => {
    if (process.env.DB_ENV == 'test') {
        // Create test tables
        await pool.query("CREATE TABLE test_recipe (\
            recipe_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(500),\
            url VARCHAR(500) UNIQUE \
            );")
        await pool.query("CREATE TABLE test_ingredient (\
            ingredient_id SERIAL NOT NULL PRIMARY KEY,\
            name VARCHAR(200) UNIQUE\
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
        await insertRecipe(dummyRecipe)
    }
})

afterAll(async () => {
    if (process.env.DB_ENV == 'test') {
        // Cleanup created db tables
        await pool.query("DROP TABLE IF EXISTS test_recipe, test_ingredient, test_recipe_ingredient")
    }
})

test('GET /recipes/recipeId', async () => {
    if (process.env.DB_ENV == 'test') {
        const response = await request(app)
            .get('/recipes/1')
            .set('Accept', 'application/json')
        expect(response.status).toEqual(200)

        const response2 = await request(app)
            .get('/recipes/10')
            .set('Accept', 'application/json')
        expect(response2.status).toEqual(500)
    } else {
        return true
    }
})

test('Database entry creation', async () => {
    if (process.env.DB_ENV == 'test') {
        let insert_dummy_2 = await insertRecipe(dummyRecipe)
        expect(insert_dummy_2).toBe(undefined)
        let insert_dummy_3 = await insertRecipe(dummyNotRecipe)
        expect(insert_dummy_3).toBe(undefined)
        let insert_dummy_4 = await insertRecipe({})
        expect(insert_dummy_4).toBe(undefined)
        let insert_dummy_5 = await insertRecipe(dummyRecipe2)
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

test('GET /', async () => {
    const response = await request(app)
        .get('/')
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
})

const dummyRecipe = {
    name:"Macaronis",
    url:"http://macaroni",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
        {
            name: "macaroni",
            amount: 100,
            unit: "g"
        },
        {
            name: "macaroni",
            amount: 200,
            unit: "g"
        }
    ]
}

const dummyRecipe2 = {
    name:"Macaronis2",
    url:"http://macaroni2",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
        {
            name: "macaroni",
            amount: 100,
            unit: "g"
        }
    ]
}

const dummyNotRecipe = {
    title:"Macaronis",
    url:"http://macaroni",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
        {
            name: "macaroni",
            amount: 100,
            unit: 10
        }
    ]
}

test('lintIngredients', () => {
    expect(lintIngredient({ name: "Tomatoes", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "tomatoes", amount: 3, unit: "cups" })
    expect(lintIngredient({ name: " Onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups" })
    expect(lintIngredient({ name: "Bell Peppers (Red)", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "bell peppers", amount: 3, unit: "cups" })
    expect(lintIngredient({ name: "Les onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups" })
    expect(lintIngredient({ name: "D'Onions ", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "onions", amount: 3, unit: "cups" })
    expect(lintIngredient({ name: "", amount: 3, unit: "cups" }))
        .toStrictEqual({ name: "", amount: 3, unit: "cups" })
})

test('isRecipe', () => {
    expect(isRecipe(dummyRecipe)).toBe(true)
    expect(isRecipe(dummyNotRecipe)).toBe(false)
    expect(isRecipe({})).toBe(false)
})

test('POST /newrecipe', async () => {
    const response = await request(app)
        .post('/newrecipe')
        .send(dummyRecipe)
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
    const responseError = await request(app)
        .post('/newrecipe')
        .send({})
        .set('Accept', 'application/json')
    expect(responseError.status).toEqual(500)


})