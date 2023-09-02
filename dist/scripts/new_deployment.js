"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
db_1.pool.query("SELECT NOW").then((res) => console.log(res.rows[0]));
