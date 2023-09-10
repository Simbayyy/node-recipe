import express from 'express'
import cors from 'cors'
import * as views from './views'
import { ensureAuthenticated } from './auth'

export const router = express.Router()
router.options(/.*/, cors(), views.options)
//router.get('/', views.home)
router.get('/recipes', views.getAllRecipes)
router.get('/recipes/:recipeId', ensureAuthenticated, views.getRecipe)
router.post('/newrecipe', cors(), views.newRecipe)
