"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFoodData = exports.addTranslatedName = exports.selectRecipe = exports.insertRecipe = exports.pool = exports.test_ = void 0;
const pg_1 = require("pg");
const types_1 = require("./types");
const dotenv = __importStar(require("dotenv"));
const logger_1 = require("./logger");
const functions_1 = require("./functions");
// Load environment variables
dotenv.config({ path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local' });
// Prefix (or not) test_ to table names 
exports.test_ = process.env.DB_ENV == 'test' ? "test_" : "";
// Connect to PostgreSQL database
exports.pool = new pg_1.Pool({
    user: process.env.PGUSER || '',
    database: process.env.PGNAME || '',
    password: process.env.PGPASSWORD || '',
    port: 5432,
    host: 'localhost',
});
function insertRecipe(unsanitized_recipe) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((0, types_1.isRecipe)(unsanitized_recipe)) {
            // Sanitize input
            let recipe = (0, functions_1.sanitizeRecipe)(unsanitized_recipe);
            try {
                // Attempts to insert recipe
                let response = yield exports.pool.query(`INSERT INTO \
            ${exports.test_}recipe(name,url) \
            VALUES($1, $2) \
            RETURNING recipe_id`, [recipe.name, recipe.url]);
                let new_recipe_id = response.rows[0].recipe_id;
                logger_1.logger.log({
                    level: 'info',
                    message: `Successfully created recipe with id ${new_recipe_id}`
                });
                // Attempts to insert all ingredients  
                let ingredients_id = yield Promise.all(recipe.ingredients.map((ingredient, index) => __awaiter(this, void 0, void 0, function* () {
                    let check_ingredient = yield exports.pool.query(`SELECT ingredient_id \
                FROM ${process.env.DB_ENV == 'test' ? "test_" : ""}ingredient \
                WHERE name = $1`, [ingredient.name]);
                    let ingredient_id;
                    if (check_ingredient.rows.length == 0) {
                        let insert_ingredient = yield exports.pool.query(`INSERT INTO \
                    ${exports.test_}ingredient(name) \
                    VALUES($1) \
                    RETURNING ingredient_id`, [ingredient.name]);
                        ingredient_id = insert_ingredient.rows[0].ingredient_id;
                    }
                    else {
                        ingredient_id = check_ingredient.rows[0].ingredient_id;
                    }
                    yield exports.pool.query(`INSERT INTO \
                    ${exports.test_}recipe_ingredient(recipe_id,ingredient_id,amount,unit) \
                    VALUES($1, $2, $3, $4);`, [new_recipe_id, ingredient_id, ingredient.amount, ingredient.unit]);
                    logger_1.logger.log({
                        level: 'info',
                        message: `Successfully inserted ingredient ${index} in the database with id ${ingredient_id}`
                    });
                    yield addTranslatedName(ingredient_id);
                    yield addFoodData(ingredient_id);
                    return ingredient_id;
                })));
                logger_1.logger.log({
                    level: 'info',
                    message: `Successfully inserted its ingredients in the database with ids ${ingredients_id}`
                });
                // Attempt to insert time
                let insert_time = yield exports.pool.query(`INSERT INTO \
            ${exports.test_}recipe_time(recipe_id,time,unit) \
            VALUES($1, $2, $3) \
            RETURNING time_id`, [new_recipe_id, recipe.time.time, recipe.time.unit]);
                logger_1.logger.log({
                    level: 'info',
                    message: `Successfully inserted its time in the database with ids ${insert_time.rows[0].time_id}`
                });
                return response;
            }
            catch (e) {
                logger_1.logger.log({
                    level: 'error',
                    message: `Failed with insertion of recipe from ${recipe.url}\nError message is ${e}. \nTime to be inserted was ${['recipe_id', recipe.time.time, recipe.time.unit]}`
                });
                return undefined;
            }
        }
        else {
            logger_1.logger.log({
                level: 'error',
                message: `Recipe from ${unsanitized_recipe.url ? unsanitized_recipe.url : "unrecognized URL"} is in fact not a recipe`
            });
            return undefined;
        }
    });
}
exports.insertRecipe = insertRecipe;
function selectRecipe(recipeId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = `SELECT * \
            FROM ${process.env.DB_ENV == 'test' ? "test_" : ""}recipe \
            WHERE recipe_id = $1`;
            const values = [recipeId];
            const result = yield exports.pool.query(query, values);
            if (result.rows.length != 0) {
                let ingredients_id = yield exports.pool.query(`SELECT i.name, ri.amount, ri.unit, i.name_en, i.fdc_id, i.high_confidence \
                FROM ${exports.test_}ingredient AS i \
                INNER JOIN ${exports.test_}recipe_ingredient AS ri\
                ON ri.recipe_id = $1\
                WHERE i.ingredient_id = ri.ingredient_id;`, [recipeId]);
                let time = yield exports.pool.query(`SELECT time, unit \
                FROM ${exports.test_}recipe_time \
                WHERE recipe_id = $1;`, [recipeId]);
                let recipe = {
                    name: result.rows[0].name,
                    url: result.rows[0].url,
                    time: { time: time.rows[0].time, unit: time.rows[0].unit },
                    ingredients: ingredients_id.rows
                };
                return (0, functions_1.sanitizeRecipe)(recipe);
            }
            else {
                throw Error("No recipe found");
            }
        }
        catch (e) {
            logger_1.logger.log({
                level: 'error',
                message: `Could not fetch recipe\nError: ${e}`
            });
            return {};
        }
    });
}
exports.selectRecipe = selectRecipe;
function addTranslatedName(ingredientId) {
    return __awaiter(this, void 0, void 0, function* () {
        let ingredientName = yield exports.pool.query(`SELECT name FROM ${exports.test_}ingredient WHERE ingredient_id = $1`, [ingredientId]);
        if (ingredientName.rows.length != 0) {
            let name = ingredientName.rows[0].name;
            let name_en = yield (0, functions_1.translateIngredient)(name);
            let insert_en = yield exports.pool.query(`UPDATE ${exports.test_}ingredient SET name_en = $1 WHERE ingredient_id = $2`, [name_en, ingredientId]);
            logger_1.logger.log({
                level: 'info',
                message: `Translated ${name} to ${name_en}`
            });
            return name_en;
        }
    });
}
exports.addTranslatedName = addTranslatedName;
function addFoodData(ingredientId) {
    return __awaiter(this, void 0, void 0, function* () {
        let ingredientName = yield exports.pool.query(`SELECT name_en FROM ${exports.test_}ingredient WHERE ingredient_id = $1`, [ingredientId]);
        if (ingredientName.rows.length != 0) {
            let name_en = ingredientName.rows[0].name_en;
            let fdc_response = yield (0, functions_1.getFoodData)(name_en);
            try {
                let insert_food = yield exports.pool.query(`UPDATE ${exports.test_}ingredient SET fdc_id = $1 WHERE ingredient_id = $2`, [fdc_response.foods[0].fdcId, ingredientId]);
                let confidence = (fdc_response.query == 'strict');
                if (confidence) {
                    yield exports.pool.query(`UPDATE ${exports.test_}ingredient SET high_confidence = TRUE WHERE ingredient_id = $1`, [ingredientId]);
                }
                logger_1.logger.log({
                    level: 'info',
                    message: `Found and added fdc data for ingredient ${name_en}, ${confidence ? 'high' : 'low'} confidence`
                });
            }
            catch (e) {
                logger_1.logger.log({
                    level: 'info',
                    message: `Could not find fdc data for ingredient ${name_en}\nReceived:${fdc_response === null || fdc_response === void 0 ? void 0 : fdc_response.error} with ${fdc_response.query} querying\nError: ${e}`
                });
            }
            return fdc_response;
        }
    });
}
exports.addFoodData = addFoodData;
