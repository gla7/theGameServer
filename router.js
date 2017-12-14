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
  app.get('/readGame/:name', requireAuth, games.read)
  app.get('/destroyGame/:name', requireAuth, games.destroy)
  // stages
  app.get('/readStage/:name', requireAuth, stages.read)
  app.get('/destroyStage/:name', requireAuth, stages.destroy)
  // gameInstances
  app.get('/readGameInstance/:id', requireAuth, gameInstances.read)
  app.get('/destroyGameInstance/:id', requireAuth, gameInstances.destroy)
  // stageInstances
  app.get('/readStageInstance/:id', requireAuth, stageInstances.read)
  app.get('/destroyStageInstance/:id', requireAuth, stageInstances.destroy)
  // hints
  app.get('/readHint/:id', requireAuth, hints.read)
  app.get('/destroyHint/:id', requireAuth, hints.destroy)
  // users
  app.get('/readUser/:name', requireAuth, users.read)
  app.get('/destroyUser/:name', requireAuth, users.destroy)
  // POSTs
  // authentication
  app.post('/createUser', authentication.createUser)
  app.post('/signIn', requireSignIn, authentication.signIn)
  // games
  app.post('/createGame', requireAuth, games.create)
  app.post('/updateGame', requireAuth, games.update)
  // stages
  app.post('/createStage', requireAuth, stages.create)
  app.post('/updateStage', requireAuth, stages.update)
  // gameInstances
  app.post('/createGameInstance', requireAuth, gameInstances.create)
  app.post('/updateGameInstance', requireAuth, gameInstances.update)
  // stageInstances
  app.post('/createStageInstance', requireAuth, stageInstances.create)
  app.post('/updateStageInstance', requireAuth, stageInstances.update)
  // hints
  app.post('/createHint', requireAuth, hints.create)
  app.post('/updateHint', requireAuth, hints.update)
  // users
  app.post('/updateUser', requireAuth, users.update)
}
