import { pool } from "../db";
import { logger } from "../logger"
import { reset_db } from "./reset_db";

logger.log({
    level:'info',
    message:`Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
})

async function add_original_id_to_recipe() {
    try {
        const exists = await pool.query("ALTER TABLE recipe \
        ADD COLUMN original_id INT;")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}

add_original_id_to_recipe().then((res) => logger.log({
    level:'info',
    message:`original_id column ${res}`
}))
