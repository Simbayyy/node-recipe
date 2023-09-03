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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateIngredient = exports.lintIngredient = exports.sanitizeRecipe = void 0;
const deepl_node_1 = __importDefault(require("deepl-node"));
function sanitizeRecipe(recipe) {
    let newrecipe = {
        name: recipe.name,
        url: recipe.url,
        time: recipe.time,
        ingredients: recipe.ingredients.filter((value, index, self) => 
        // Remove ingredients with duplicate names
        index === self.findIndex((t) => (t.name === value.name))).map(lintIngredient)
    };
    return newrecipe;
}
exports.sanitizeRecipe = sanitizeRecipe;
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
        unit: ingredient.unit
    };
    return newingredient;
}
exports.lintIngredient = lintIngredient;
const authKey = process.env.DEEPL_KEY || "";
const translator = new deepl_node_1.default.Translator(authKey);
function translateIngredient(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield translator.translateText(name, "fr", 'en-US');
        return result.text;
    });
}
exports.translateIngredient = translateIngredient;
