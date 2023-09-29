/* eslint no-multi-str: "off" */

import passport from 'passport'
import * as crypto from 'crypto'
import { Strategy } from 'passport-local'
import { pool, test_ } from './db'
import express from 'express'
import { logger } from './logger'
import cors from 'cors'
import * as views from './views'

export const authRouter = express.Router()
authRouter.options(/.*/, cors(), views.options)

passport.use('local', new Strategy(async function verify (username: string, password: string, cb: any) {
  try {
    const getUser = await pool.query(`SELECT * FROM ${test_}users WHERE username =$1`, [username])
    if (getUser.rows.length !== 0) {
      const row = getUser.rows[0]
      crypto.pbkdf2(password, Buffer.from(row.salt, 'hex'), 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) { return cb(err) }
        if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
          logger.log({
            level: 'info',
            message: 'Failed to find user'
          })
          return cb(null, false, { message: 'Incorrect username or password.' })
        }
        logger.log({
          level: 'info',
          message: 'Successfully found user'
        })
        return cb(null, row)
      })
    } else {
      logger.log({
        level: 'info',
        message: 'Failed to find user'
      })
      return cb(null, false, { message: 'Incorrect username or password.' })
    }
  } catch (err) {
    logger.log({
      level: 'info',
      message: 'Failed to get user'
    })
    if (err !== null) { return cb(err) }
  }
}))

passport.serializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, admin: user.admin })
  })
})

passport.deserializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    return cb(null, user)
  })
})

authRouter.post('/logout', cors(), function (req, res, next) {
  req.logout(function (err) {
    if (err !== null) { next(err); return }
    logger.log({ level: 'info', message: `Successfully logged out ${JSON.stringify(req.user ?? {})}` })
    res.json({ success: true })
  })
})

authRouter.post('/password', cors(), (req: any, res: any, next: any) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      logger.log({ level: 'error', message: `Authentication error occured: \n${err}`})
      return next(err)
    }
    if (!user) {
      // Authentication failed
      logger.log({ level: 'error', message: 'Incorrect username or password.' })
      return res.status(500).json({ success: false, code: 'incorrect', error: 'Incorrect username or password' })
    }
    // Authentication successful
    req.logIn(user, (err: any) => {
      if (err) {
        return next(err)
      }
      logger.log({ level: 'info', message: 'successful login.' })
      return res.status(200).json({ username: req.user.username, admin: req.user.admin })
    })
  })(req, res, next)
},
(err: any, req: any, res: any, next: any) => {
  // This middleware handles errors that occur during login
  console.error('Login error:', err)
  logger.log({ level: 'error', message: 'error in login.' })
  res.status(500).json({ success: false, code: 'error', error: 'Something went wrong during login' })
}
)

authRouter.get('/password', cors(), ensureAuthenticated, (req: any, res: any) => {
  res.json({ success: true })
})
authRouter.post('/signup', cors(), function (req: any, res: any, next): any {
  const salt = crypto.randomBytes(16)
  if (req.body.password.length < 8) { return res.status(500).json({ success: false, code: 'shortpass' }) }
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword): Promise<any> {
    try {
      if (err) { return next(err) }
      const insertUser = await pool.query('INSERT INTO \
        users (username, password, email, salt) \
        VALUES ($1, $3,$2,$4)\
        RETURNING id, username',
      [req.body.username,
        req.body.email,
        hashedPassword.toString('hex'),
        salt.toString('hex')])
      const user = {
        id: insertUser.rows[0].id,
        username: req.body.username
      }
      req.logIn(user, (err: any) => {
        if (err) {
          return next(err)
        }
        logger.log({ level: 'info', message: 'successful login.' })
        return res.status(200).json({ username: req.user.username, admin: req.user.admin })
      })
    } catch (err) {
      return next(err)
    }
  })
},
(err: any, req: any, res: any, next: any) => {
  // This middleware handles errors that occur during signup
  console.error('Signup error:', err)
  logger.log({ level: 'error', message: 'error in signup.' })
  res.status(500).json({ success: false, code: err.code })
})

export function isAdmin (req: any, res: any, next: () => any): any {
  if (req.user.admin === true) {
    return next()
  }
  res.status(500).json({ success: false, code: 'unauthorized' })
  logger.log({
    level: 'info',
    message: `User ${req.user.username} attempted to check admin resources but their admin value is ${req.user.admin}`
  })
}

export function ensureAuthenticated (req: any, res: any, next: () => any): any {
  if (req.isAuthenticated() === true) {
    return next()
  }
  res.redirect('/login')
  logger.log({
    level: 'info',
    message: 'Access forbidden'
  })
}
