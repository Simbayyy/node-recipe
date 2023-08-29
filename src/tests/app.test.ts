import { expect, test } from 'vitest'
import request from 'supertest'
import {app} from '../app'
import { Recipe, isRecipe } from '../types'


test('Dummy test', () => {
  expect(1).toBe(1)
})

test('GET /', async () => {
    const response = await request(app)
        .get('/')
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
})

const dummyRecipe = {
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
}

const dummyNotRecipe = {
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
            unit: 10
        }
    ]
}

test('isRecipe', () => {
    expect(isRecipe(dummyRecipe)).toBe(true)
    expect(isRecipe(dummyNotRecipe)).toBe(false)
    expect(isRecipe({})).toBe(false)
})

test('POST /newrecipe', async () => {
    const response = await request(app)
        .post('/newrecipe')
        .send(dummyRecipe)
        .set('Accept', 'application/json')
    expect(response.status).toEqual(200)
    const responseError = await request(app)
        .post('/newrecipe')
        .send({})
        .set('Accept', 'application/json')
    expect(responseError.status).toEqual(500)


})