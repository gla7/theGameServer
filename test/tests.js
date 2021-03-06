// imports
import mongoose from 'mongoose'
import chai from 'chai'
import chaiHttp from 'chai-http'
import Game from '../models/game'
import User from '../models/user'
import Stage from '../models/stage'
import server from '../testServer'
import home from './homepage'
import auth from './authentication'
import game from './game'
import stage from './stage'
import hint from './hint'
import gameInstance from './gameInstance'
import stageInstance from './stageInstance'

// chai tools
const expect = chai.expect
const should = chai.should()
const app = server.app
chai.use(chaiHttp)

// store the jwt token in this variable for testing
let token

describe('ALL TESTS:', () => {
  //Before starting the test, create a sandboxed database connection
  //Once a connection is established invoke done()
  before(done => {
    mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost/theGameTestDatabase')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error'))
    db.once('open', () => {
      console.log('We are connected to test database!')
      done()
    })
  })

  describe('HOMEPAGE TESTS:', () => {
    it('Navigates to the homepage', done => { home.shouldNavigate(app, done) })
  })

  describe('AUTHENTICATION TESTS:', () => {
    it('Cannot mark me as logged in if I pass no token', done => { auth.noTokenNoLogIn(app, done) })
    it('Cannot mark me as logged in if I pass a bad token', done => { auth.badTokenNoLogIn(app, done) })
    it('Cannot create user if name missing', done => { auth.cannotCreateUserIfNoName(app, done) })
    it('Cannot create user if email missing', done => { auth.cannotCreateUserIfNoEmail(app, done) })
    it('Cannot create user if password missing', done => { auth.cannotCreateUserIfNoPassword(app, done) })

    // need to write out the test here because we set the value of the token for all tests to come
    it('Creates user if all of the aforementioned is present', done => {
      chai.request(app)
      .post('/createUser')
      .send({ name: 'test', email: 'test@test.com', password: 'test123' })
      .end((err, res) => {
        User.find({ name: 'test' }, (errUser, users) => {
          if (err) { throw err }
          should.equal(errUser, null)
          users.length.should.equal(1)
          res.should.have.status(200)
          token = res.body.token
          done()
        })
      })
    })

    it('Cannot create user if name exists', done => { auth.cannotCreateUserNameTaken(app, done) })
    it('Cannot create user if email exists', done => { auth.cannotCreateUserEmailTaken(app, done) })
    it('Logs in with token from sign up', done => { auth.goodTokenFromSignUp(app, token, done) })
    it('Cannot sign in with bad password', done => { auth.noSignInWithBadPassword(app, done) })
    it('Cannot sign in with bad credentials', done => { auth.noSignInWithBadCreds(app, done) })

    // as above, need to write out the test here because we set the value of the token for all tests to come
    it('Signs in if passing right credentials', done => {
      chai.request(app)
      .post('/signIn')
      .send({ name: 'test', password: 'test123' })
      .end((err, res) => {
        User.find({ name: 'test' }, (errUser, users) => {
          if (err) { throw err }
          should.equal(errUser, null)
          users.length.should.equal(1)
          res.should.have.status(200)
          token = res.body.token
          done()
        })
      })
    })

    it('Marks me logged with a token from sign in', done => { auth.goodTokenFromSignIn(app, token, done) })
    it('Updates only permitted user attributes', done => { auth.updatesOnlyPermittedUserAttributes(app, token, done) })
    it('Cannot read with bad token', done => { auth.cannotReadWithBadToken(app, token, done) })
    it('Cannot read with bad name', done => { auth.cannotReadWithBadName(app, token, done) })
    it('Reads if all is good', done => { auth.readsIfAllGood(app, token, done) })
  })

  describe('GAME TESTS:', () => {
    it('Cannot create without login', done => { game.cannotCreateIfLoggedOut(app, done) })
    it('Cannot create with a bad token', done => { game.cannotCreateWithBadToken(app, done) })
    it('Cannot create without a name', done => { game.cannotCreateIfNoName(app, token, done) })
    it('Creates if all is good, and the user gets authorship for it', done => { game.createsIfAllGood(app, token, done) })
    it('Cannot create if name is taken', done => { game.cannotCreateIfNameTaken(app, token, done) })
    it('Cannot destroy if name does not exist', done => { game.cannotDestroyIfNone(app, token, done) })
    it('Cannot destroy with a bad token', done => { game.cannotDestroyWithBadToken(app, done) })
    it('Destroys if all is good, and reflects this in the author', done => { game.destroysIfAllGood(app, token, done) })
    it('Cannot update with bad token', done => { game.cannotUpdateWithBadToken(app, token, done) })
    it('Cannot update with bad name', done => { game.cannotUpdateWithBadName(app, token, done) })
    it('Updates only permitted game attributes', done => { game.updatesOnlyPermittedGameAttributes(app, token, done) })
    it('Cannot read with bad token', done => { game.cannotReadWithBadToken(app, token, done) })
    it('Cannot read with bad name', done => { game.cannotReadWithBadName(app, token, done) })
    it('Reads if all is good', done => { game.readsIfAllGood(app, token, done) })
  })

  describe('STAGE TESTS:', () => {
    it('Cannot create without login', done => { stage.cannotCreateIfLoggedOut(app, done) })
    it('Cannot create with a bad token', done => { stage.cannotCreateWithBadToken(app, done) })
    it('Cannot create without a name', done => { stage.cannotCreateIfNoName(app, token, done) })
    it('Cannot create without a content', done => { stage.cannotCreateIfNoContent(app, token, done) })
    it('Cannot create without instructions', done => { stage.cannotCreateIfNoInstructions(app, token, done) })
    it('Cannot create without answer', done => { stage.cannotCreateIfNoAnswer(app, token, done) })
    it('Creates if all is good, and the user gets authorship for it, but not a game', done => { stage.createsIfAllGoodNoGame(app, token, done) })
    it('Creates if all is good, and the user gets authorship for it, and added to game', done => { stage.createsIfAllGoodWithGame(app, token, done) })
    it('Destroys if all is good, and reflects this in the author and game', done => { stage.destroysWithNoTraceGameIncluded(app, token, done) })
    it('Removes game ref if game is destroyed', done => { stage.noGameRefIfGameDestroyed(app, token, done) })
    it('Cannot destroy if name does not exist', done => { stage.cannotDestroyIfNone(app, token, done) })
    it('Cannot destroy with a bad token', done => { stage.cannotDestroyWithBadToken(app, done) })
    it('Cannot update with bad token', done => { stage.cannotUpdateWithBadToken(app, token, done) })
    it('Cannot update with bad name', done => { stage.cannotUpdateWithBadName(app, token, done) })
    it('Updates only permitted stage attributes', done => { stage.updatesOnlyPermittedStageAttributes(app, token, done) })
    it('Cannot read with bad token', done => { stage.cannotReadWithBadToken(app, token, done) })
    it('Cannot read with bad name', done => { stage.cannotReadWithBadName(app, token, done) })
    it('Reads if all is good', done => { stage.readsIfAllGood(app, token, done) })
  })

  describe('HINT TESTS:', () => {
    it('Cannot create without login', done => { hint.cannotCreateIfLoggedOut(app, done) })
    it('Cannot create with a bad token', done => { hint.cannotCreateWithBadToken(app, done) })
    it('Cannot create without a stage', done => { hint.cannotCreateIfNoStage(app, token, done) })
    it('Cannot create without a text', done => { hint.cannotCreateIfNoText(app, token, done) })
    it('Cannot create with a bad stage', done => { hint.cannotCreateWithBadStage(app, token, done) })
    it('Creates if all is good, and the stage gets credit', done => { hint.createsIfAllGood(app, token, done) })
    it('Cannot destroy if id does not exist', done => { hint.cannotDestroyIfNone(app, token, done) })
    it('Cannot destroy with a bad token', done => { hint.cannotDestroyWithBadToken(app, done) })
    it('Destroys if all is good, and reflects this in the stage', done => { hint.destroysWithNoTrace(app, token, done) })
    it('Destroys hint if associated stage is destroyed', done => { hint.noHintIfStageDestroyed(app, token, done) })
    it('Cannot update with bad token', done => { hint.cannotUpdateWithBadToken(app, token, done) })
    it('Cannot update with bad id', done => { hint.cannotUpdateWithBadId(app, token, done) })
    it('Updates if all is good', done => { hint.updatesIfAllGood(app, token, done) })
    it('Cannot read with bad token', done => { hint.cannotReadWithBadToken(app, token, done) })
    it('Cannot read with bad id', done => { hint.cannotReadWithNoHint(app, token, done) })
    it('Reads if all is good', done => { hint.readsIfAllGood(app, token, done) })
  })

  describe('GAMEINSTANCE TESTS:', () => {
    it('Cannot create without login', done => { gameInstance.cannotCreateIfLoggedOut(app, token, done) })
    it('Cannot create with a bad token', done => { gameInstance.cannotCreateWithBadToken(app, done) })
    it('Cannot create with a bad game id', done => { gameInstance.cannotCreateWithBadGameId(app, token, done) })
    it('Creates if all is good, creates stageInstances and associations to users', done => { gameInstance.createsIfAllGood(app, token, done) })
  })

  describe('STAGEINSTANCE TESTS:', () => {
    it('Cannot update without login', done => { stageInstance.cannotUpdateIfLoggedOut(app, done) })
    it('Cannot update with a bad token', done => { stageInstance.cannotUpdateWithBadToken(app, done) })
    it('Cannot update with a bad id', done => { stageInstance.cannotUpdateWithBadId(app, token, done) })
    it('Cannot update if user is not conductor', done => { stageInstance.nonConductorCannotUpdate(app, done) })
    it('Cannot update if passing wrong sets of attributes', done => { stageInstance.cannotUpdateWithBadAttributes(app, token, done) })
    it('Updates finalized and time and return next stage instance', done => { stageInstance.updatesFinalizedAndTimeAndReturnsNextStageInstance(app, token, done) })
    it('Updates hintsUsed and time', done => { stageInstance.updatesHintsUsedAndTime(app, token, done) })
    it('Updates answers and time for wrong answers', done => { stageInstance.updatesAnswersAndTimeForWrongAnswers(app, token, done) })
    it('Updates answers and time for right answers and returns next', done => { stageInstance.updatesAnswersAndTimeForRightAnswersReturnsNext(app, token, done) })
    it('Updates answers and time for right answers and returns game instance', done => { stageInstance.updatesAnswersAndTimeForRightAnswersReturnsGameInstance(app, token, done) })
    it('Updates answers and time with deduction for wrong answer', done => { stageInstance.updatesWithDeductionForWrongAnswer(app, token, done) })
    it('Updates answers and time with deduction for hints used', done => { stageInstance.updatesWithDeductionForHintUsed(app, token, done) })
  })

  describe('DB TESTS:', () => {
    //Save object with 'name' value of 'Mike'
    it('New name saved to test database', done => {
      var testName = new Game({
        name: 'Mike'
      })

      testName.save(done)
    })

    it('Dont save incorrect format to database', done => {
      //Attempt to save with wrong info. An error should trigger
      var wrongSave = new Game({
        notName: 'Not Mike'
      })
      wrongSave.save(err => {
        if (err) { return done() }
        throw new Error('Should generate error!')
      })
    })

    it('Should retrieve data from test database', done => {
      //Look up the 'Mike' object previously saved.
      Game.find({ name: 'Mike' }, (err, name) => {
        if (err) { throw err }
        if (name.length === 0) { throw new Error('No data!') }
        done()
      })
    })
  })

  //After all tests are finished drop database and close connection
  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      server.testServer.close(() => {
        console.log('Server closed!')
        mongoose.connection.close(done)
        console.log('Mongoose connection closed!')
        setTimeout(() => { process.exit(0) }, 2000)
      })
    })
  })
})
