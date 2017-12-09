// imports
import passport from 'passport'
import homepage from './controller/homepage'
import authentication from './controller/authentication'

// passport setup for token sessions (false to cookie sessions)
const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignIn = passport.authenticate('local', { session: false })

export default function (app) {
  // gets
  app.get('/', homepage)
  app.get('/loggedIn', requireAuth, authentication.loggedIn)
  //posts
  app.post('/createTeam', authentication.createTeam)
  app.post('/signIn', requireSignIn, authentication.signIn)
}
