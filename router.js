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
  app.get('/', homepage)
  app.get('/loggedIn', requireAuth, authentication.loggedIn)
  app.get('/readGame/:name', requireAuth, games.read)
  app.get('/readStage/:name', requireAuth, stages.read)
  // TODO: need to pass all reads to being by id, screwed up on that one!
  app.get('/readStageById/:id', requireAuth, stages.readById)
  app.get('/readGameInstance/:id', requireAuth, gameInstances.read)
  app.get('/readHint/:id', requireAuth, hints.read)
  app.get('/readUser/:name', requireAuth, users.read)
  // POSTs
  app.post('/createUser', authentication.createUser)
  app.post('/searchUsers', requireAuth, users.search)
  app.post('/signIn', requireSignIn, authentication.signIn)
  app.post('/createGame', requireAuth, games.create)
  app.post('/searchGames', requireAuth, games.search)
  app.post('/createStage', requireAuth, stages.create)
  app.post('/searchStages', requireAuth, stages.search)
  app.post('/createGameInstance', requireAuth, gameInstances.create)
  app.post('/createStageInstance', requireAuth, stageInstances.create)
  app.post('/readStageInstance', requireAuth, stageInstances.read)
  app.post('/createHint', requireAuth, hints.create)
  // DELETEs
  app.delete('/destroyGame/:name', requireAuth, games.destroy)
  app.delete('/destroyStage/:name', requireAuth, stages.destroy)
  app.delete('/destroyGameInstance/:id', requireAuth, gameInstances.destroy)
  app.delete('/destroyStageInstance/:id', requireAuth, stageInstances.destroy)
  app.delete('/destroyHint/:id', requireAuth, hints.destroy)
  app.delete('/destroyUser/:name', requireAuth, users.destroy)
  // PUTs
  app.put('/updateGame/:name', requireAuth, games.update)
  app.put('/updateStage/:name', requireAuth, stages.update)
  app.put('/updateGameInstance/:id', requireAuth, gameInstances.update)
  app.put('/updateStageInstance/:id', requireAuth, stageInstances.update)
  app.put('/updateHint/:id', requireAuth, hints.update)
  app.put('/updateUser/:name', requireAuth, users.update)
}
