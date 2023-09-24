import { pool } from "../db";
import { logger } from "../logger"

logger.log({
    level:'info',
    message:`Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
})

async function add_users_table() {
    try {
        const exists = await pool.query("CREATE TABLE users (\
        id SERIAL PRIMARY KEY,\
        username VARCHAR(50) UNIQUE NOT NULL,\
        email VARCHAR(255) UNIQUE NOT NULL,\
        password VARCHAR(255) NOT NULL,\
        salt VARCHAR(255),\
        created_at TIMESTAMP DEFAULT NOW(),\
        updated_at TIMESTAMP,\
        admin BOOLEAN DEFAULT false,\
        is_active BOOLEAN DEFAULT true);")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}

async function add_admin_to_users() {
    try {
        const exists = await pool.query("ALTER TABLE users \
        ADD COLUMN admin BOOLEAN DEFAULT false;")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}


add_users_table().then((res) => logger.log({
    level:'info',
    message:`Users table ${res}`
}))

add_admin_to_users().then((res) => logger.log({
    level:'info',
    message:`Column admin to table users ${res}`
}))
