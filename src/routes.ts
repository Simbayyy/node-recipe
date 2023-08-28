import express from 'express'
import * as app from './app'

const router = express.Router()

export function home (_: any, res: any) {
  res.render('home.hbs')
  app.logger.log({
    level: 'info',
    message: `Home loaded`
  });
}