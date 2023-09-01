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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.logger = void 0;
const winston = __importStar(require("winston"));
const dotenv = __importStar(require("dotenv"));
const routes = __importStar(require("./routes"));
const db_1 = require("./db");
const hbs_1 = __importDefault(require("hbs"));
const express_1 = __importDefault(require("express"));
// Load environment variables
dotenv.config({ path: process.env.NODE_ENV == 'production' ? '.env' : '.env.development.local' });
// Create logger
exports.logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
exports.app = (0, express_1.default)();
const port = 3000;
exports.app.use(express_1.default.json());
exports.app.use('/', routes.router);
exports.app.set('view engine', hbs_1.default);
let is_db_initialized = db_1.pool.query("SELECT * FROM information_schema.tables \
  WHERE table_name = 'recipe';").then((result) => __awaiter(void 0, void 0, void 0, function* () {
    if (result.rows.length == 0) {
        yield db_1.pool.query("CREATE TABLE recipe (\
          recipe_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),\
          name VARCHAR(500),\
          url VARCHAR(500) UNIQUE \
          );");
        yield db_1.pool.query("CREATE TABLE ingredient (\
          ingredient_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1),\
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
    }
}));
exports.app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    exports.logger.log({
        level: 'info',
        message: `Server running on port ${port}`
    });
    exports.logger.log({
        level: 'info',
        message: `Environment variables used are from ${process.env.TEST_VALUE}`
    });
}));
