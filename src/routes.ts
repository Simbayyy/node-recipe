import express from 'express'
import * as views from './views'

export const router = express.Router()

router.get('/', views.home)
router.post('/newrecipe', views.newRecipe)

