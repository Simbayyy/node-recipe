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
const app_1 = require("../app");
const db_1 = require("../db");
app_1.logger.log({
    level: 'info',
    message: "Resetting DB tables"
});
reset_db();
function reset_db() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.pool.query("DROP TABLE IF EXISTS recipe, ingredient, recipe_ingredient, recipe_time");
        yield db_1.pool.query("CREATE TABLE recipe (\
    recipe_id SERIAL NOT NULL PRIMARY KEY,\
    name VARCHAR(500),\
    url VARCHAR(500) UNIQUE \
    );");
        yield db_1.pool.query("CREATE TABLE ingredient (\
    ingredient_id SERIAL NOT NULL PRIMARY KEY,\
    name VARCHAR(200) UNIQUE\
    );");
        yield db_1.pool.query("CREATE TABLE recipe_ingredient (\
    recipe_id INT,\
    ingredient_id INT,\
    amount INT, \
    unit VARCHAR(100),\
    PRIMARY KEY (recipe_id, ingredient_id),\
    CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id),\
    CONSTRAINT fk_ingredient FOREIGN KEY(ingredient_id) REFERENCES ingredient(ingredient_id)\
    );");
        yield db_1.pool.query("CREATE TABLE recipe_time (\
    time_id SERIAL NOT NULL PRIMARY KEY,\
    recipe_id INT,\
    time INT, \
    unit VARCHAR(100),\
    CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id)\
    );");
    });
}
