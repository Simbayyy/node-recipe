import express from 'express'
import cors from 'cors'
import * as views from './views'
import { ensureAuthenticated } from './auth'

export const router = express.Router()
router.options(/.*/, cors(), views.options)
//router.get('/', views.home)
router.get('/recipes', views.getAllRecipes)
router.get('/recipes/:recipeId', process.env.DB_ENV == 'test' ? (req:any, res:any, next: () => any) => { return next()} : ensureAuthenticated, views.getRecipe)
router.post('/newrecipe', cors(), views.newRecipe)
router.get('/check-auth', cors(), (req:any, res:any) => {
    res.status(200).json({authenticated:req.isAuthenticated()})
})
