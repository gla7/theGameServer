// imports
import chai from 'chai'
import User from '../models/user'
import Game from '../models/game'

// chai tools
const expect = chai.expect
const should = chai.should()

function cannotCreateIfLoggedOut (app, done) {
  chai.request(app)
  .post('/createGame')
  .send({ name: 'gameTest' })
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      games.length.should.equal(0)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function cannotCreateWithBadToken (app, done) {
  chai.request(app)
  .post('/createGame')
  .set('Authorization', 'badToken')
  .send({ name: 'gameTest' })
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      games.length.should.equal(0)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function cannotCreateIfNoName (app, token, done) {
  chai.request(app)
  .post('/createGame')
  .set('Authorization', token)
  .send({ badName: 'gameTest' })
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      err.should.not.equal(null)
      games.length.should.equal(0)
      res.should.have.status(500)
      done()
    })
  })
}

function createsIfAllGood (app, token, done) {
  chai.request(app)
  .post('/createGame')
  .set('Authorization', token)
  .send({ name: 'gameTest' })
  .end((err, res) => {
    User.find({ name: 'test' }, (errUser, users) => {
      Game.findById(users[0].gamesCreated[0], (errGame, game) => {
        game.author.toString().should.equal(users[0].id)
        users[0].gamesCreated[0].toString().should.equal(game._id.toString())
        res.should.have.status(200)
        done()
      })
    })
  })
}

function cannotCreateIfNameTaken (app, token, done) {
  chai.request(app)
  .post('/createGame')
  .set('Authorization', token)
  .send({ name: 'gameTest' })
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      err.should.not.equal(null)
      res.body.error.should.equal('This game name already exists!')
      games.length.should.equal(1)
      res.should.have.status(422)
      done()
    })
  })
}

function cannotDestroyIfNone (app, token, done) {
  chai.request(app)
  .get('/destroyGame/nonExistentGameName')
  .set('Authorization', token)
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      should.equal(err, null)
      games.length.should.equal(1)
      res.should.have.status(200)
      done()
    })
  })
}

function cannotDestroyWithBadToken (app, done) {
  chai.request(app)
  .get('/destroyGame/gameTest')
  .set('Authorization', 'badToken')
  .end((err, res) => {
    Game.find({ name: 'gameTest' }, (errGame, games) => {
      games.length.should.equal(1)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function destroysIfAllGood (app, token, done) {
  chai.request(app)
  .get('/destroyGame/gameTest')
  .set('Authorization', token)
  .end((err, res) => {
    User.find({ name: 'test' }, (errUser, users) => {
      Game.find({ name: 'gameTest' }, (errGame, games) => {
        users[0].gamesCreated.length.should.equal(0)
        games.length.should.equal(0)
        res.should.have.status(200)
        res.text.should.equal('Success')
        done()
      })
    })
  })
}

export default {
  cannotCreateIfLoggedOut,
  cannotCreateWithBadToken,
  cannotCreateIfNoName,
  createsIfAllGood,
  cannotCreateIfNameTaken,
  cannotDestroyIfNone,
  cannotDestroyWithBadToken,
  destroysIfAllGood,
}