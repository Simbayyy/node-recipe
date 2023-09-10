import passport from 'passport'
import * as crypto from 'crypto'
import {Strategy} from 'passport-local'
import { pool, test_ } from './db'
import express from 'express'
import { logger } from './logger'

export const authRouter = express.Router()

passport.use('local', new Strategy(async function verify(username, password, cb) {
    try {
        const get_user = await pool.query(`SELECT * FROM ${test_}users WHERE username =$1`, [ username ])
        if (get_user.rows.length != 0) {
            let row = get_user.rows[0]
            crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                if (err) { return cb(err); }
                if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                  return cb(null, false, { message: 'Incorrect username or password.' });
                }
                return cb(null, row);
              });
        
        } else {
            return cb(null, false, { message: 'Incorrect username or password.' });
        }
    } catch (err) {
      if (err) { return cb(err); }
    }
}));

authRouter.post('/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));


passport.serializeUser(function(user:any, cb) {
process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
});
});

passport.deserializeUser(function(user:any, cb) {
process.nextTick(function() {
    return cb(null, user);
});
});

export function ensureAuthenticated(req:any, res:any, next: () => any) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
    logger.log({
        level:'info',
        message:'Access forbidden'
    })
  }