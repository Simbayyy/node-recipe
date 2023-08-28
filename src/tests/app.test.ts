import { expect, test } from 'vitest'
import request from 'supertest'
import {app} from '../app'


test('Dummy test', () => {
  expect(1).toBe(1)
})

test('GET /', async () => {
    const response = await request(app)
        .get('/')
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
})

test('POST /newrecipe', async () => {
    const response = await request(app)
        .post('/newrecipe')
        .send({
            title:"Macaronis",
            url:"http://macaroni",
            time: {
                time: 10,
                unit: "min"
            },
            ingredients: [
                {
                    name: "macaroni",
                    amount: 100,
                    unit: "g"
                }
            ]
        })
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
})