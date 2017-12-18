// imports
import chai from 'chai'
import GameInstance from '../models/gameInstance'
import StageInstance from '../models/stageInstance'
import User from '../models/user'
import Game from '../models/game'
import Stage from '../models/stage'
import Hint from '../models/hint'

// chai tools
const expect = chai.expect
const should = chai.should()

function cannotCreateIfLoggedOut (app, token, done) {
  // here we create the foundation for the tests for gameInstances and stageInstances:
  // we have our creator user, test and 3 other users test2, test3 and test4
  // test created 2 games, game1 with 3 stages stage1, stage2, and stage 3
  // and game2 with 2 stages stage4 and stage 5
  // stage2 has one hint, hint1, whilst stage5 has two, hint2 and hint3
  // note also that stage3 has timeUntilOneTenthDeduction of 10s
  // and stage4 has percentageDeductionPerWrongAnswer of 20
  // hint3 has percentDeductionIfUsed of 30
  // view all this at any time by adding the following code:
  // User.find({}, (err, users) => {
  //   Game.find({}, (err, games) => {
  //     Stage.find({}, (err, stages) => {
  //       Hint.find({}, (err, hints) => {
  //         console.log("USERS: ", users)
  //         console.log("GAMES: ", games)
  //         console.log("STAGES: ", stages)
  //         console.log("HINTS: ", hints)
  //         done()
  //       })
  //     })
  //   })
  // })
  User.findOneAndUpdate({ name: 'test' }, { stagesCreated: [] }, { new: true }, (err, user) => {
    User.create(
      [
        (new User({ name: 'test2', email: 'test2@test.com', password: 'test' })),
        (new User({ name: 'test3', email: 'test3@test.com', password: 'test' })),
        (new User({ name: 'test4', email: 'test4@test.com', password: 'test' }))
      ],
      (err) => {
        chai.request(app)
        .post('/createGame')
        .set('Authorization', token)
        .send({ name: 'game1' })
        .end((errFirst, resFirst) => {
          chai.request(app)
          .post('/createGame')
          .set('Authorization', token)
          .send({ name: 'game2' })
          .end((errSecond, resSecond) => {
            Game.findOne({ name: 'game1' }, (errGame1, game1) => {
              Game.findOne({ name: 'game2' }, (errGame1, game2) => {
                chai.request(app)
                .post('/createStage')
                .set('Authorization', token)
                .send({ name: 'stage1', content: 'test content', instructions: 'test instructions', answer: 'test answer 1', createdThroughGame: game1 })
                .end((errThird, resThird) => {
                  chai.request(app)
                  .post('/createStage')
                  .set('Authorization', token)
                  .send({ name: 'stage2', content: 'test content', instructions: 'test instructions', answer: 'test answer 2', createdThroughGame: game1 })
                  .end((errFourth, resFourth) => {
                    chai.request(app)
                    .post('/createStage')
                    .set('Authorization', token)
                    .send({ name: 'stage3', content: 'test content', instructions: 'test instructions', answer: 'test answer 3', createdThroughGame: game1, timeUntilOneTenthDeduction: 10 })
                    .end((errFifth, resFifth) => {
                      chai.request(app)
                      .post('/createStage')
                      .set('Authorization', token)
                      .send({ name: 'stage4', content: 'test content', instructions: 'test instructions', answer: 'test answer 4', createdThroughGame: game2, percentageDeductionPerWrongAnswer: 20 })
                      .end((errSixth, resSixth) => {
                        chai.request(app)
                        .post('/createStage')
                        .set('Authorization', token)
                        .send({ name: 'stage5', content: 'test content', instructions: 'test instructions', answer: 'test answer 5', createdThroughGame: game2 })
                        .end((errSeventh, resSeventh) => {
                          Stage.findOne({ name: 'stage2' }, (errStage2, stage2) => {
                            Stage.findOne({ name: 'stage5' }, (errStage5, stage5) => {
                              chai.request(app)
                              .post('/createHint')
                              .set('Authorization', token)
                              .send({ stage: stage2, text: 'hint1' })
                              .end((errEight, resEight) => {
                                chai.request(app)
                                .post('/createHint')
                                .set('Authorization', token)
                                .send({ stage: stage5, text: 'hint2' })
                                .end((errNinth, resNinth) => {
                                  chai.request(app)
                                  .post('/createHint')
                                  .set('Authorization', token)
                                  .send({ stage: stage5, text: 'hint3', percentDeductionIfUsed: 30 })
                                  .end((errTenth, resTenth) => {
                                    // setup ends here
                                    User.findOne({ name: 'test2' }, (errTest2, test2) => {
                                      User.findOne({ name: 'test3' }, (errTest3, test3) => {
                                        chai.request(app)
                                        .post('/createGameInstance')
                                        .send({ game: game1, team: [test2._id, test3._id] })
                                        .end((errEleventh, resEleventh) => {
                                          GameInstance.find({}, (errGameInstances, gameInstances) => {
                                            gameInstances.length.should.equal(0)
                                            resEleventh.status.should.equal(401)
                                            resEleventh.text.should.equal('Unauthorized')
                                            errEleventh.should.not.equal(null)
                                            done()
                                          })
                                        })
                                      })
                                    })
                                  })
                                })
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      }
    )
  })
}

function cannotCreateWithBadToken (app, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    User.findOne({ name: 'test2' }, (errTest2, test2) => {
      User.findOne({ name: 'test3' }, (errTest3, test3) => {
        chai.request(app)
        .post('/createGameInstance')
        .set('Authorization', 'badToken')
        .send({ game: game1, team: [test2._id, test3._id] })
        .end((err, res) => {
          GameInstance.find({}, (errGameInstances, gameInstances) => {
            gameInstances.length.should.equal(0)
            res.status.should.equal(401)
            res.text.should.equal('Unauthorized')
            err.should.not.equal(null)
            done()
          })
        })
      })
    })
  })
}

function cannotCreateWithBadGameId (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    User.findOne({ name: 'test2' }, (errTest2, test2) => {
      User.findOne({ name: 'test3' }, (errTest3, test3) => {
        chai.request(app)
        .post('/createGameInstance')
        .set('Authorization', token)
        .send({ game: `${game1}AndThenSome`, team: [test2._id, test3._id] })
        .end((err, res) => {
          GameInstance.find({}, (errGameInstances, gameInstances) => {
            gameInstances.length.should.equal(0)
            res.status.should.equal(500)
            err.should.not.equal(null)
            done()
          })
        })
      })
    })
  })
}

function createsIfAllGood (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    User.findOne({ name: 'test2' }, (errTest2, test2) => {
      User.findOne({ name: 'test3' }, (errTest3, test3) => {
        chai.request(app)
        .post('/createGameInstance')
        .set('Authorization', token)
        .send({ game: game1, team: [test2._id, test3._id] })
        .end((err, res) => {
          User.findOne({ name: 'test' }, (errTest1, test1) => {
            User.findOne({ name: 'test2' }, (errTest2, test2) => {
              User.findOne({ name: 'test3' }, (errTest3, test3) => {
                GameInstance.find({}, (errGameInstances, gameInstances) => {
                  StageInstance.find({}, (errStageInstances, stageInstances) => {
                    should.equal(err, null)
                    gameInstances.length.should.equal(1)
                    gameInstances[0].conductor.toString().should.equal(test1._id.toString())
                    gameInstances[0].team.toString().should.include(test2._id.toString())
                    gameInstances[0].team.toString().should.include(test3._id.toString())
                    gameInstances[0].game.toString().should.equal(game1._id.toString())
                    gameInstances[0].finalized.should.equal(false)
                    gameInstances[0].stages.toString().should.equal(game1.stages.toString())
                    test1.gamesInProgress.toString().should.include(gameInstances[0]._id.toString())
                    test2.gamesInProgress.toString().should.include(gameInstances[0]._id.toString())
                    test3.gamesInProgress.toString().should.include(gameInstances[0]._id.toString())
                    gameInstances[0].stages.length.should.equal(stageInstances.length)
                    res.status.should.equal(200)
                    done()
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

export default {
  cannotCreateIfLoggedOut,
  cannotCreateWithBadToken,
  cannotCreateWithBadGameId,
  createsIfAllGood,
}
