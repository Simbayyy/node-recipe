import { pool, test_ } from "./db"
import { logger } from "./logger"

export async function addFoodData (ingredientId: number): Promise<any> {
    const ingredientName = await pool.query(`SELECT name_en, fdc_id FROM ${test_}ingredient WHERE ingredient_id = $1`, [ingredientId])
    if (ingredientName.rows.length !== 0) {
      if (ingredientName.rows[0].fdc_id == undefined) {
        const nameEn = ingredientName.rows[0].name_en
        const fdcResponse = await getFoodData(nameEn)
        const energy = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Energy"
        })[0] ?? {value:0}).value * 1000)
        const protein = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Protein"
        })[0] ?? {value:0}).value * 1000)
        const lipid = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Total lipid (fat)"
        })[0] ?? {value:0}).value * 1000)
        const carbohydrates = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Carbohydrate, by difference"
        })[0] ?? {value:0}).value * 1000)
        const iron = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Iron, Fe"
        })[0] ?? {value:0}).value * 1000)
        const magnesium = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Magnesium, Mg"
        })[0] ?? {value:0}).value * 1000)
        const calcium = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Calcium, Ca"
        })[0] ?? {value:0}).value * 1000)
        const fiber = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Fiber, total dietary"
        })[0] ?? {value:0}).value * 1000)
        const zinc = Math.floor((fdcResponse.foods[0].foodNutrients.filter((elt) => {
            return elt.nutrientName == "Zinc, Zn"
        })[0] ?? {value:0}).value * 1000)
        try {
          await pool.query(`UPDATE ${test_}ingredient SET \
            fdc_id = $1, \
            energy = $3, \
            protein = $4,\
            lipid = $5,\
            carbohydrates = $6,\
            iron = $7,\
            magnesium = $8,\
            calcium = $9,\
            fiber = $10,\
            zinc = $11\
            WHERE ingredient_id = $2`, [fdcResponse.foods[0].fdcId, ingredientId, energy, protein, lipid, carbohydrates, iron, magnesium, calcium, fiber, zinc])
          const confidence = (fdcResponse.query === 'strict')
          if (confidence) {
            await pool.query(`UPDATE ${test_}ingredient SET high_confidence = TRUE WHERE ingredient_id = $1`, [ingredientId])
          }
          logger.log({
            level: 'info',
            message: `Found and added fdc data for ingredient ${nameEn}, ${confidence ? 'high' : 'low'} confidence`
          })
        } catch (e: any) {
          logger.log({
            level: 'info',
            message: `Could not find fdc data for ingredient ${nameEn}\nReceived:${fdcResponse?.error} with ${fdcResponse.query} querying\nError: ${e}`
          })
        }
        return fdcResponse
      } else {
        logger.log({
          level: 'info',
          message: `Ingredient ${ingredientName.rows[0].name_en} already has an FDC ID, ${ingredientName.rows[0].fdc_id}`
        })
        return ingredientName.rows[0].fdc_id
      }
    }
  }
  
  
// Setup FoodData Central access
export async function getFoodData (name: string): Promise<any> {
    let response: any = { status: 'Looking for ID', error: '', query: 'strict' }
    const dataTypes = ['Foundation', 'Survey (FNDDS)', 'SR Legacy']
  
    for (const query of [`+${name}`.replace(/ /, ' +'), name]) {
      for (const dataType of dataTypes) {
        if (response.status === 'Looking for ID') {
          const body = {
            query,
            dataType: [
              dataType
            ],
            pageSize: 1,
            pageNumber: 1
          }
          const request = {
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': process.env.FOOD_DATA_KEY ?? 'no_key'
            },
            method: 'POST',
            body: JSON.stringify(body)
          }
          const url = 'https://api.nal.usda.gov/fdc/v1/foods/search'
          await fetch(url, request).then(async (res) => { return await res.json() }).then((res) => {
            logger.log({ level: 'info', message: `Found id for ${name} in ${dataType}, ${response.query}: ${res.foods[0].fdcId}` })
            response = res
          }).catch((e: any) => {
            response.error += `Could not find ID in ${dataType}\n`
          })
          if (query === name) {
            response.query = 'loose'
          } else {
            response.query = 'strict'
          }
        }
      }
    }
    return response
  }
  
export const nutrients: {name:string, remote_name:string}[] = [
    {
        remote_name:"Energy",
        name:"energy"
    },
    {
        remote_name:"Protein",
        name:"protein"
    },
    {
        remote_name:"Total lipid (fat)",
        name:"lipid"
    },
    {
        remote_name:"Carbohydrate, by difference",
        name:"carbohydrates"
    },
    {
        remote_name:"Iron, Fe",
        name:"iron"
    },
    {
        remote_name:"Magnesium, Mg",
        name:"magnesium"
    },
    {
        remote_name:"Calcium, Ca",
        name:"calcium"
    },
    {
        remote_name:"Fiber, total dietary",
        name:"fiber"
    },
    {
        remote_name:"Zinc, Zn",
        name:"zinc"
    },
]