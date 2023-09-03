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
const db_1 = require("../db");
const logger_1 = require("../logger");
logger_1.logger.log({
    level: 'info',
    message: `Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
});
function add_english_column() {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield db_1.pool.query("SELECT column_name \
    FROM information_schema.columns\
    WHERE table_name='ingredient' and column_name='name_en';");
        if (exists.rows.length == 0) {
            const add_column = yield db_1.pool.query("ALTER TABLE ingredient \
            ADD COLUMN name_en VARCHAR(200)");
            return 'added';
        }
        else {
            return 'not added';
        }
    });
}
add_english_column().then((res) => logger_1.logger.log({
    level: 'info',
    message: `English name column ${res}`
}));
