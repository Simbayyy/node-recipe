import * as dotenv from 'dotenv'
import * as routes from './routes'
import express from 'express'
import { logger } from './logger'
import path from 'path'
import { authRouter } from './auth'
import session from 'express-session'
import passport from 'passport'
import pgstore from 'connect-pg-simple'
import { pool } from './db'

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.development.local' })

export const app = express()
const port = 3000

const Store = pgstore(session)

app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET ?? 'no_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  store: new Store({
    pool:pool,
  })
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(passport.authenticate('session'))
app.use('/login/', authRouter)
app.use('/api/', routes.router)
app.use(express.static(path.resolve(__dirname, 'react')))
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'react', 'index.html'))
})

app.listen(port, () => {
  logger.log({
    level: 'info',
    message: `Server running on port ${port}`
  })
  logger.log({
    level: 'info',
    message: `Environment variables used are from ${process.env.TEST_VALUE}`
  })
})
