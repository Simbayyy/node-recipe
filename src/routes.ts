import express from 'express'
import cors from 'cors'
import * as views from './views'
import { ensureAuthenticated, isAdmin } from './auth'

export const router = express.Router()
router.options(/.*/, cors(), views.options)
//router.get('/', views.home)
router.get('/recipes', views.getAllRecipes)
router.get('/recipes/:recipeId', process.env.DB_ENV == 'test' ? (req:any, res:any, next: () => any) => { return next()} : ensureAuthenticated, views.getRecipe)
router.post('/newrecipe', cors(), views.newRecipe)
router.post('/parse', cors(), views.parseRecipe)
router.get('/check-auth', cors(), (req:any, res:any) => {
    try {
        res.status(200).json({authenticated:req.isAuthenticated(),user:req.user.username,admin:req.user.admin})
    } catch {
        res.status(200).json({authenticated:false, user:"",admin:false})
    }
})
router.get('/check-admin', cors(), isAdmin, (req:any, res:any) => {
    res.status(200).json({success:true,admin:req.user.admin})
})

router.get('/ingredients', cors(), isAdmin, views.getAllIngredients)