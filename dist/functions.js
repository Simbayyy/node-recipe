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
exports.getFoodData = exports.translateIngredient = exports.lintIngredient = exports.sortIngredients = exports.sanitizeRecipe = void 0;
const logger_1 = require("./logger");
const deepl = __importStar(require("deepl-node"));
function sanitizeRecipe(recipe) {
    let newrecipe = {
        name: recipe.name,
        url: recipe.url,
        time: recipe.time,
        ingredients: recipe.ingredients.filter((value, index, self) => 
        // Remove ingredients with duplicate names
        index === self.findIndex((t) => (t.name === value.name))).map(lintIngredient).sort(sortIngredients)
    };
    return newrecipe;
}
exports.sanitizeRecipe = sanitizeRecipe;
function sortIngredients(a, b) {
    return a.name > b.name ? -1 : 1;
}
exports.sortIngredients = sortIngredients;
function lintIngredient(ingredient) {
    let newingredient = {
        name: ingredient.name
            .replace(/\(.*/, "")
            .toLowerCase()
            .replace(/^ ?(du|les?|la|des?) /, "")
            .replace(/^ ?(d|l|s)'/, "")
            .replace(/^ /, "")
            .replace(/ $/, ""),
        amount: ingredient.amount,
        unit: ingredient.unit,
        name_en: ingredient.name_en ? ingredient.name_en : undefined
    };
    return newingredient;
}
exports.lintIngredient = lintIngredient;
// Setup DeepL API access
const authKey = process.env.DEEPL_KEY || "no_key";
const translator = new deepl.Translator(authKey);
function translateIngredient(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield translator.translateText(name, "fr", 'en-US');
        return result.text;
    });
}
exports.translateIngredient = translateIngredient;
// Setup FoodData Central access
function getFoodData(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = { status: "Looking for ID", error: "", query: 'strict' };
        let dataTypes = ["Foundation", "Survey (FNDDS)", "SR Legacy"];
        for (let query of [`+${name}`.replace(/ /, " +"), name]) {
            if (query == name) {
                response.query = 'loose';
            }
            for (let dataType of dataTypes)
                if (response.status == "Looking for ID") {
                    let body = {
                        query: query,
                        dataType: [
                            dataType,
                        ],
                        pageSize: 1,
                        pageNumber: 1
                    };
                    let request = {
                        headers: {
                            "Content-Type": "application/json",
                            "X-Api-Key": process.env.FOOD_DATA_KEY || "no_key"
                        },
                        method: 'POST',
                        body: JSON.stringify(body)
                    };
                    let url = "https://api.nal.usda.gov/fdc/v1/foods/search";
                    yield fetch(url, request).then((res) => { return res.json(); }).then((res) => {
                        logger_1.logger.log({ level: "info", message: `Found id for ${name} in ${dataType}, ${response.query}: ${res.foods[0].fdcId}` });
                        response = res;
                    }).catch((e) => {
                        response.error += `Could not find ID in ${dataType}\n`;
                    });
                }
        }
        return response;
    });
}
exports.getFoodData = getFoodData;
