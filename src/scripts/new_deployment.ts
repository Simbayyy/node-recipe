import { pool } from "../db"

pool.query("SELECT NOW").then((res) => console.log(res.rows[0]))
