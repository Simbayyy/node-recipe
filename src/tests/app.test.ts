import { expect, test, afterAll, beforeAll, describe } from 'vitest'
import request from 'supertest'
import {app} from '../app'
import { Recipe, isRecipe } from '../types'
import {pool, insertRecipeSchema, selectIngredient} from '../db' 
import { lintIngredient, sanitizeRecipe } from '../functions'
import { dummyIngredients, dummyIngredientsResponse, dummyLDJSON, dummyNotRecipe, dummyPage, dummyRecipe, dummyRecipe2, dummyResponse, dummyResponseIngredient } from './dummy_values'
import { parseRecipeFromPage, parseRecipeIngredient, parseRecipeSchema, shortenName } from '../recipe_parser'
import { getFoodData } from '../food'

if (process.env.DB_ENV == 'test') {
    describe("Database tests", () => {
        beforeAll(async () => {
            // Create test tables
            await pool.query("CREATE TABLE test_recipe (\
                recipe_id SERIAL NOT NULL PRIMARY KEY,\
                name VARCHAR(500),\
                url VARCHAR(500) UNIQUE,\
                prepTime VARCHAR(20),\
                cookTime VARCHAR(20),\
                totalTime VARCHAR(20),\
                recipeYield VARCHAR(500),\
                recipeCategory VARCHAR(500),\
                recipeInstructions VARCHAR(1000),\
                recipeCuisine VARCHAR(500),\
                user_id INT DEFAULT 0\
                );")
            await pool.query("CREATE TABLE test_ingredient (\
                ingredient_id SERIAL NOT NULL PRIMARY KEY,\
                name VARCHAR(200) UNIQUE,\
                short_name VARCHAR(200),\
                name_en VARCHAR(200),\
                fdc_id INT,\
                energy INT,\
                protein INT,\
                lipid INT,\
                carbohydrates INT,\
                iron INT,\
                magnesium INT,\
                calcium INT,\
                sodium INT,\
                fiber INT,\
                zinc INT,\
                density VARCHAR(6),\
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
            await pool.query("CREATE TABLE test_user_recipe (\
                id SERIAL NOT NULL PRIMARY KEY,\
                recipe_id INT,\
                user_id INT,\
                CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES test_recipe(recipe_id)\
                );")    
            await pool.query("CREATE TABLE test_users (\
                id SERIAL NOT NULL PRIMARY KEY,\
                email VARCHAR(200) UNIQUE,\
                username VARCHAR(200) UNIQUE,\
                salted_password VARCHAR(200)\
                );")
            await insertRecipeSchema(dummyRecipe)
        })

        afterAll(async () => {
                // Cleanup created db tables
                await pool.query("DROP TABLE IF EXISTS test_recipe, test_ingredient, test_recipe_ingredient, test_user_recipe, test_users")
        })
    
        test('getFoodData', async () => {
            let breadId = await getFoodData('bread')
            expect(breadId.foods[0].fdcId).toEqual(2343330)
            let noId = await getFoodData('noID')
            expect(noId).toHaveProperty('error')
        })

        test('GET /api/recipes/recipeId', async () => {
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
        })

        test('selectIngredient', async () => {
            const response = await selectIngredient(1)
            expect(response).toStrictEqual(dummyResponseIngredient)
            return true    
        })
    
        test('Database entry creation', async () => {
            let insert_dummy_2 = await insertRecipeSchema(dummyRecipe)
            expect(insert_dummy_2).toBe(1)
            let insert_dummy_3 = await insertRecipeSchema(dummyNotRecipe)
            expect(insert_dummy_3).toBe(undefined)
            let insert_dummy_4 = await insertRecipeSchema({})
            expect(insert_dummy_4).toBe(undefined)
            let insert_dummy_5 = await insertRecipeSchema(dummyRecipe2)
            expect(insert_dummy_5).toBe(2)
        })
    
        test('Database structure', async () => {
            let are_tables_created = await pool.query("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'public';")
            expect(are_tables_created.rows).toEqual(expect.arrayContaining([
                {table_name: 'test_recipe'},
                {table_name: 'test_ingredient'},
                {table_name: 'test_recipe_ingredient'},
            ]))
        })
    })
}


describe('Parsing functions', () => {
    test('parse ld-json script', () => {
        expect(parseRecipeFromPage(dummyPage)).toStrictEqual(dummyLDJSON)
    })

    test('parse ingredient', () => {
        expect(parseRecipeIngredient(dummyIngredients)).toStrictEqual(dummyIngredientsResponse)
        expect(parseRecipeIngredient(["1 tasse de lait(s) froid"]))
            .toStrictEqual([{
                amount: 1,
                unit:'tasse',
                name:"lait froid",
                short_name:"lait"
            }])
    })

    test('shorten name', () => {
        expect(shortenName('lait froid')).toEqual('lait')
        expect(shortenName('bâtons de carottes')).toEqual('carottes');
        expect(shortenName('dés de pommes coupées en julienne')).toEqual('pommes');
        expect(shortenName('chocolat en neige')).toEqual('chocolat');
        expect(shortenName('courgettes surgelées & émincées')).toEqual('courgettes');
        expect(shortenName('frites pelées')).toEqual('frites');
        expect(shortenName('poulet battu')).toEqual('poulet');
        expect(shortenName('tomates concassées')).toEqual('tomates');
        expect(shortenName('poisson mixé et mariné')).toEqual('poisson');
        expect(shortenName('fraises blanchies et râpées')).toEqual('fraises');
        expect(shortenName('test sans préfixe ni suffixe')).toEqual('test sans préfixe ni suffixe');
        expect(shortenName('')).toEqual('');
    })
})

describe('Ingredient linting', () => {
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
})