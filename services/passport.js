import passport from 'passport'
import User from '../models/user'
import config from '../config'
import passportJwt from 'passport-jwt'
import LocalStrategy from 'passport-local'

const JwtStrategy = passportJwt.Strategy
const ExtractJwt = passportJwt.ExtractJwt

// create local Strategy for logging in
const localLogin = new LocalStrategy({ usernameField: 'name' }, (name, password, done) => {
  // verify user name and pw, call done w/user if correct name and pw, else call done w/false
  User.findOne({ name: name }, (err, user) => {
    if (err) { return done(err) }
    if (!user) { return done(null, false) }
    // compare pw's
    user.comparePassword(password, (errUser, isMatch) => {
      if (errUser) { return done(errUser) }
      if (!isMatch) { return done(null, false) }
      return done(null, user)
    })
  })
})

// setup options for jwt Strategy that will be used when creating the strategy next
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
}

// create jwt Strategy for signing up
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // payload is token together with sub and iat, done is a function, where it finds the token is specified in the jwtOptions
  // see if user id in the payload exists in our db
  // if it does, call done with that user
  // otherwise call done without user object
  User.findById(payload.sub, (err, user) => {
    if (err) { return done(err, false) }
    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
})

// tell passport to use this strategy
passport.use(jwtLogin)
passport.use(localLogin)
