"use strict";
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
exports.newRecipe = exports.getRecipe = exports.options = exports.home = void 0;
const logger_1 = require("./logger");
const db_1 = require("./db");
const functions_1 = require("./functions");
const types_1 = require("./types");
function home(_, res) {
    res.render('home.hbs');
    logger_1.logger.log({
        level: 'info',
        message: `Home loaded`
    });
}
exports.home = home;
function options(req, res) {
    logger_1.logger.log({
        level: 'info',
        message: `Options queried`
    });
}
exports.options = options;
function getRecipe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let recipe = yield (0, db_1.selectRecipe)(req.params.recipeId);
            if ((0, types_1.isRecipe)(recipe)) {
                res.status(200).json(recipe);
            }
            else {
                throw Error(`Selected object is not a recipe: ${JSON.stringify(recipe)}`);
            }
        }
        catch (e) {
            logger_1.logger.log({
                level: 'error',
                message: `Could not get recipe ${req.params.recipeId}\nError: ${e}`
            });
            res.status(500).json({ error: "Could not get desired recipe" });
        }
    });
}
exports.getRecipe = getRecipe;
function newRecipe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.header("Access-Control-Allow-Origin", "*");
        try {
            const recipe = req.body;
            if ((0, types_1.isRecipe)(recipe)) {
                logger_1.logger.log({
                    level: 'info',
                    message: `New recipe ${recipe.name} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
                });
                (0, db_1.insertRecipe)((0, functions_1.sanitizeRecipe)(recipe));
                res.status(200).json(recipe);
            }
            else {
                logger_1.logger.log({
                    level: 'error',
                    message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
                });
                res.status(500);
                throw TypeError("Request body not of the Recipe type");
            }
        }
        catch (e) {
            logger_1.logger.log({
                level: 'error',
                message: `Could not read request body in newRecipe.`
            });
            res.status(500).json({ error: "no" });
        }
    });
}
exports.newRecipe = newRecipe;
