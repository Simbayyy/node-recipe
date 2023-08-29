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
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRecipe = exports.home = void 0;
const app = __importStar(require("./app"));
const types_1 = require("./types");
function home(_, res) {
    res.render('home.hbs');
    app.logger.log({
        level: 'info',
        message: `Home loaded`
    });
}
exports.home = home;
function newRecipe(req, res) {
    try {
        const recipe = req.body;
        if ((0, types_1.isRecipe)(recipe)) {
            app.logger.log({
                level: 'info',
                message: `New recipe ${recipe.title} detected from ${recipe.url}!\n Recipe JSON is ${JSON.stringify(recipe)}`
            });
            res.status(200).json(recipe);
        }
        else {
            app.logger.log({
                level: 'error',
                message: `New recipe is not corresponding to the Recipe type, but rather ${req}`
            });
            throw TypeError("Request body not of the Recipe type");
        }
    }
    catch (_a) {
        app.logger.log({
            level: 'error',
            message: `Could not read request body in newRecipe`
        });
        throw TypeError("Request body not readable");
    }
}
exports.newRecipe = newRecipe;
