// imports
import passport from 'passport'
import homepage from './controller/homepage'
import authentication from './controller/authentication'
import games from './controller/games'
import stages from './controller/stages'
import gameInstances from './controller/gameInstances'
import stageInstances from './controller/stageInstances'
import hints from './controller/hints'
import users from './controller/users'

// passport setup for token sessions (false to cookie sessions)
const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignIn = passport.authenticate('local', { session: false })

export default function (app) {
  // GETs
  // homepage
  app.get('/', homepage)
  // authentication
  app.get('/loggedIn', requireAuth, authentication.loggedIn)
  // games
  app.get('/loadGame/:name', requireAuth, games.load)
  app.get('/destroyGame/:name', requireAuth, games.destroy)
  // stages
  app.get('/loadStage/:name', requireAuth, stages.load)
  app.get('/destroyStage/:name', requireAuth, stages.destroy)
  // gameInstances
  app.get('/loadGameInstance/:id', requireAuth, gameInstances.load)
  app.get('/destroyGameInstance/:id', requireAuth, gameInstances.destroy)
  // stageInstances
  app.get('/loadStageInstance/:id', requireAuth, stageInstances.load)
  app.get('/destroyStageInstance/:id', requireAuth, stageInstances.destroy)
  // hints
  app.get('/loadHint/:id', requireAuth, hints.load)
  app.get('/destroyHint/:id', requireAuth, hints.destroy)
  // users
  app.get('/loadUser/:name', requireAuth, users.load)
  app.get('/destroyUser/:name', requireAuth, users.destroy)
  // POSTs
  // authentication
  app.post('/createUser', authentication.createUser)
  app.post('/signIn', requireSignIn, authentication.signIn)
  // games
  app.post('/createGame', requireAuth, games.create)
  app.post('/editGame', requireAuth, games.edit)
  // stages
  app.post('/createStage', requireAuth, stages.create)
  app.post('/editStage', requireAuth, stages.edit)
  // gameInstances
  app.post('/createGameInstance', requireAuth, gameInstances.create)
  app.post('/editGameInstance', requireAuth, gameInstances.edit)
  // stageInstances
  app.post('/createStageInstance', requireAuth, stageInstances.create)
  app.post('/editStageInstance', requireAuth, stageInstances.edit)
  // hints
  app.post('/createHint', requireAuth, hints.create)
  app.post('/editHint', requireAuth, hints.edit)
  // users
  app.post('/editUser', requireAuth, users.edit)
}
