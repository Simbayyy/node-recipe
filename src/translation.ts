import * as deepl from 'deepl-node'
import { pool, test_ } from './db'
import { logger } from './logger'

// Setup DeepL API access
const authKey = process.env.DEEPL_KEY ?? 'no_key'
const translator = new deepl.Translator(authKey)

export async function translateIngredient (name: string): Promise<string> {
  const result = await translator.translateText(name, 'fr', 'en-US')
  return result.text
}

export async function addTranslatedName (ingredientId: number): Promise<string | undefined> {
    const ingredientName = await pool.query(`SELECT short_name, name_en FROM ${test_}ingredient WHERE ingredient_id = $1`, [ingredientId])
    if (ingredientName.rows.length !== 0) {
      if (ingredientName.rows[0].name_en == undefined) {
        const name = ingredientName.rows[0].short_name
        const nameEn = await translateIngredient(name)
        await pool.query(`UPDATE ${test_}ingredient SET name_en = $1 WHERE ingredient_id = $2`, [nameEn, ingredientId])
        logger.log({
          level: 'info',
          message: `Translated ${name} to ${nameEn}`
        })
        return nameEn
      } else {
        const name = ingredientName.rows[0].short_name
        const nameEn = ingredientName.rows[0].name_en
        logger.log({
          level: 'info',
          message: `${name} already translated to ${nameEn}`
        })
        return nameEn
      }
    }
  }
  