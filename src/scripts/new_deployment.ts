import { pool } from "../db";
import { logger } from "../logger"
import { reset_db } from "./reset_db";

logger.log({
    level:'info',
    message:`Deployment of app in ${process.env.APP_NAME}, at ${console.time()}`
})

async function add_short_name_to_ingredients() {
    try {
        const exists = await pool.query("ALTER TABLE ingredient \
        ADD COLUMN short_name VARCHAR(200);")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}

async function update_existing_ingredients() {
    try {
        const exists = await pool.query("UPDATE ingredient \
        SET short_name = name;")
        return 'updated'
    }
    catch (err) {
        return `not updated: ${err}`
    }
}


async function add_nutrients_to_ingredients() {
    try {
        const exists = await pool.query("ALTER TABLE ingredient \
        ADD COLUMN energy INT,\
        ADD COLUMN protein INT,\
        ADD COLUMN lipid INT,\
        ADD COLUMN carbohydrates INT,\
        ADD COLUMN iron INT,\
        ADD COLUMN magnesium INT,\
        ADD COLUMN calcium INT,\
        ADD COLUMN fiber INT,\
        ADD COLUMN zinc INT")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}

async function add_density_to_ingredients() {
    try {
        const exists = await pool.query("ALTER TABLE ingredient \
        ADD COLUMN density VARCHAR(6)")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}


async function add_sodium_to_ingredients() {
    try {
        const exists = await pool.query("ALTER TABLE ingredient \
        ADD COLUMN sodium INT")
        return 'added'
    }
    catch (err) {
        return `not added: ${err}`
    }
}


async function add_user_recipe_table() {
    try {
        const exists = await pool.query("CREATE TABLE user_recipe (\
            id SERIAL NOT NULL PRIMARY KEY,\
            recipe_id INT,\
            user_id INT,\
            CONSTRAINT fk_recipe FOREIGN KEY(recipe_id) REFERENCES recipe(recipe_id)\
            );")
            return `added`
        }
    catch (err) {
        return `not added: ${err}`
    }
}




add_short_name_to_ingredients().then((res) => logger.log({
    level:'info',
    message:`short_name column ${res}`
}))

update_existing_ingredients().then((res) => logger.log({
    level:'info',
    message:`Existing ingredients ${res}`
}))

add_nutrients_to_ingredients().then((res) => logger.log({
    level:'info',
    message:`Nutrients ${res}`
}))

add_density_to_ingredients().then((res) => logger.log({
    level:'info',
    message:`Density ${res}`
}))

add_sodium_to_ingredients().then((res) => logger.log({
    level:'info',
    message:`Sodium ${res}`
}))

add_user_recipe_table().then((res) => logger.log({
    level:'info',
    message:`User recipe link ${res}`
}))