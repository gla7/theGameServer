import passport from 'passport'
import Team from '../models/team'
import config from '../config'
import passportJwt from 'passport-jwt'
import LocalStrategy from 'passport-local'

const JwtStrategy = passportJwt.Strategy
const ExtractJwt = passportJwt.ExtractJwt

// create local Strategy for logging in
const localLogin = new LocalStrategy({ usernameField: 'name' }, (name, password, done) => {
  // verify team name and pw, call done w/team if correct name and pw, else call done w/false
  Team.findOne({ name: name }, (err, team) => {
    if (err) { return done(err) }
    if (!team) { return done(null, false) }
    // compare pw's
    team.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err) }
      if (!isMatch) { return done(null, false) }
      return done(null, team)
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
  // if it does, call done with that team
  // otherwise call done without team object
  Team.findById(payload.sub, (err, team) => {
    if (err) { return done(err, false) }
    if (team) {
      done(null, team)
    } else {
      done(null, false)
    }
  })
})

// tell passport to use this strategy
passport.use(jwtLogin)
passport.use(localLogin)
