// imports
import chai from 'chai'
import User from '../models/user'
import Game from '../models/game'
import Stage from '../models/stage'

// chai tools
const expect = chai.expect
const should = chai.should()

function cannotCreateIfLoggedOut (app, done) {
  chai.request(app)
  .post('/createStage')
  .send({ name: 'stageTest', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      stages.length.should.equal(0)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function cannotCreateWithBadToken (app, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', 'badToken')
  .send({ name: 'stageTest', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      stages.length.should.equal(0)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function cannotCreateIfNoName (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((err, res) => {
    Stage.find({ content: 'test content' }, (errStage, stages) => {
      err.should.not.equal(null)
      stages.length.should.equal(0)
      res.should.have.status(500)
      done()
    })
  })
}

function cannotCreateIfNoContent (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageTest', instructions: 'test instructions', answer: 'test answer' })
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      err.should.not.equal(null)
      stages.length.should.equal(0)
      res.should.have.status(500)
      done()
    })
  })
}

function cannotCreateIfNoInstructions (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageTest', content: 'test content', answer: 'test answer' })
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      err.should.not.equal(null)
      stages.length.should.equal(0)
      res.should.have.status(500)
      done()
    })
  })
}

function cannotCreateIfNoAnswer (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageTest', content: 'test content', instructions: 'test instructions' })
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      err.should.not.equal(null)
      stages.length.should.equal(0)
      res.should.have.status(500)
      done()
    })
  })
}

function createsIfAllGoodNoGame (app, token, done) {
  chai.request(app)
  .post('/createGame')
  .set('Authorization', token)
  .send({ name: 'gameTest' })
  .end((errFirstRequest, resFirstRequest) => {
    chai.request(app)
    .post('/createStage')
    .set('Authorization', token)
    .send({ name: 'stageTest', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
    .end((errSecondRequest, resSecondRequest) => {
      User.find({ name: 'test' }, (errUser, users) => {
        Stage.findById(users[0].stagesCreated[0], (errStage, stage) => {
          Game.find({ name: 'gameTest' }, (errGame, games) => {
            users[0].stagesCreated[0].toString().should.equal(stage._id.toString())
            games[0].stages.length.should.equal(0)
            stage.author.toString().should.equal(users[0].id)
            should.equal(stage.createdThroughGame, null)
            resFirstRequest.should.have.status(200)
            resSecondRequest.should.have.status(200)
            done()
          })
        })
      })
    })
  })
}

function createsIfAllGoodWithGame (app, token, done) {
  Game.find({ name: 'gameTest' }, (errGame, games) => {
    chai.request(app)
    .post('/createStage')
    .set('Authorization', token)
    .send({ name: 'stageTestWithGame', content: 'test content', instructions: 'test instructions', answer: 'test answer', createdThroughGame: games[0] })
    .end((err, res) => {
      User.find({ name: 'test' }, (errUser, users) => {
        Game.find({ name: 'gameTest' }, (errGame, updatedGames) => {
          Stage.findById(users[0].stagesCreated[1], (errStage, stage) => {
            users[0].stagesCreated[1].toString().should.equal(stage._id.toString())
            updatedGames[0].stages[0].toString().should.equal(stage._id.toString())
            stage.author.toString().should.equal(users[0].id)
            stage.createdThroughGame.toString().should.equal(updatedGames[0].id)
            res.should.have.status(200)
            done()
          })
        })
      })
    })
  })
}

function destroysWithNoTraceGameIncluded (app, token, done) {
  Stage.find({ name: 'stageTestWithGame' }, (errStage, stages) => {
    chai.request(app)
    .get('/destroyStage/stageTestWithGame')
    .set('Authorization', token)
    .end((err, res) => {
      Game.find({ name: 'gameTest' }, (errGame, games) => {
        User.find({ name: 'test' }, (errUser, users) => {
          Stage.find({ name: 'stageTestWithGame' }, (errUpdatedStage, updatedStages) => {
            updatedStages.length.should.equal(0)
            games[0].stages.length.should.equal(0)
            users[0].stagesCreated[users[0].stagesCreated.length - 1].toString().should.not.equal(stages[0]._id.toString())
            res.should.have.status(200)
            done()
          })
        })
      })
    })
  })
}

function noGameRefIfGameDestroyed (app, token, done) {
  Game.find({ name: 'gameTest' }, (errGame, games) => {
    chai.request(app)
    .post('/createStage')
    .set('Authorization', token)
    .send({ name: 'stageTestWithGame', content: 'test content', instructions: 'test instructions', answer: 'test answer', createdThroughGame: games[0] })
    .end((errFirstRequest, resFirstRequest) => {
      chai.request(app)
      .get('/destroyGame/gameTest')
      .set('Authorization', token)
      .end((errSecondRequest, resSecondRequest) => {
        User.find({ name: 'test' }, (errUser, users) => {
          Game.find({ name: 'gameTest' }, (errUpdatedGame, updatedGames) => {
            Stage.findById(users[0].stagesCreated[1], (errStage, stage) => {
              users[0].gamesCreated.length.should.equal(0)
              updatedGames.length.should.equal(0)
              should.equal(stage.createdThroughGame, null)
              resSecondRequest.should.have.status(200)
              resSecondRequest.text.should.equal('Success')
              done()
            })
          })
        })
      })
    })
  })
}

function cannotDestroyIfNone (app, token, done) {
  chai.request(app)
  .get('/destroyStage/nonExistentStageName')
  .set('Authorization', token)
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      should.equal(err, null)
      stages.length.should.equal(1)
      res.should.have.status(200)
      done()
    })
  })
}

function cannotDestroyWithBadToken (app, done) {
  chai.request(app)
  .get('/destroyStage/stageTest')
  .set('Authorization', 'badToken')
  .end((err, res) => {
    Stage.find({ name: 'stageTest' }, (errStage, stages) => {
      stages.length.should.equal(1)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

export default {
  cannotCreateIfLoggedOut,
  cannotCreateWithBadToken,
  cannotCreateIfNoName,
  cannotCreateIfNoContent,
  cannotCreateIfNoInstructions,
  cannotCreateIfNoAnswer,
  createsIfAllGoodNoGame,
  createsIfAllGoodWithGame,
  destroysWithNoTraceGameIncluded,
  noGameRefIfGameDestroyed,
  cannotDestroyIfNone,
  cannotDestroyWithBadToken,
}
