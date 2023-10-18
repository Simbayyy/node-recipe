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

async function remove_unique_from_recipe_url() {
    try {
        const exists = await pool.query("ALTER TABLE recipe \
        DROP CONSTRAINT recipe_url_key;")
        return 'removed'
    }
    catch (err) {
        return `not removed: ${err}`
    }
}

add_original_id_to_recipe().then((res) => logger.log({
    level:'info',
    message:`original_id column ${res}`
}))

remove_unique_from_recipe_url().then((res) => logger.log({
    level:'info',
    message:`Unique url ${res}`
}))
