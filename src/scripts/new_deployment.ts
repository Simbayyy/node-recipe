import { pool } from "../db";
import { logger } from "../logger"

logger.log({
    level:'info',
    message:`Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
})

async function add_fdc_id_column() {
    const exists = await pool.query("SELECT column_name \
    FROM information_schema.columns\
    WHERE table_name='ingredient' and column_name='fdc_id';")
    if (exists.rows.length == 0) {
        const add_column = await pool.query("ALTER TABLE ingredient \
            ADD COLUMN fdc_id INT")
        return 'added'
    }
    else {
        return 'not added'
    }
}

add_fdc_id_column().then((res) => logger.log({
    level:'info',
    message:`fdc id name column ${res}`
}))
