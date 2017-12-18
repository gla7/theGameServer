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

function cannotUpdateIfLoggedOut (app, done) {
  Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
    StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
      chai.request(app)
      .put(`/updateStageInstance/${stageInstance1._id.toString()}`)
      .send({ time: 777, finalized: true })
      .end((err, res) => {
        res.status.should.equal(401)
        res.text.should.equal('Unauthorized')
        err.should.not.equal(null)
        done()
      })
    })
  })
}

function cannotUpdateWithBadToken (app, done) {
  Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
    StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
      chai.request(app)
      .put(`/updateStageInstance/${stageInstance1._id.toString()}`)
      .set('Authorization', 'badToken')
      .send({ time: 777, finalized: true })
      .end((err, res) => {
        res.status.should.equal(401)
        res.text.should.equal('Unauthorized')
        err.should.not.equal(null)
        done()
      })
    })
  })
}

function cannotUpdateWithBadId (app, token, done) {
  Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
    StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
      chai.request(app)
      .put(`/updateStageInstance/${stageInstance1._id.toString()}AndThenSome`)
      .set('Authorization', token)
      .send({ time: 777, finalized: true })
      .end((err, res) => {
        res.status.should.equal(500)
        err.should.not.equal(null)
        done()
      })
    })
  })
}

function nonConductorCannotUpdate (app, done) {
  chai.request(app)
  .post('/signIn')
  .send({ name: 'test2', password: 'test' })
  .end((err, res) => {
    const tokenForTest2 = res.body.token
    Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
      StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
        chai.request(app)
        .put(`/updateStageInstance/${stageInstance1._id.toString()}`)
        .set('Authorization', tokenForTest2)
        .send({ time: 777, finalized: true })
        .end((errSecond, resSecond) => {
          resSecond.status.should.equal(200)
          resSecond.text.should.equal('You do not have the permission to do this.')
          done()
        })
      })
    })
  })
}

function cannotUpdateWithBadAttributes (app, token, done) {
  Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
    StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
      chai.request(app)
      .put(`/updateStageInstance/${stageInstance1._id.toString()}`)
      .set('Authorization', token)
      .send({ time: 777, finalized: true, hintsUsed: [] })
      .end((err, res) => {
        res.status.should.equal(200)
        res.text.should.equal('You may only update two attributes at one time, one of which must be time and the other must be either hintsUsed, answers or finalized.')
        done()
      })
    })
  })
}

function updatesFinalizedAndTimeAndReturnsNextStageInstance (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    Stage.findOne({ name: 'stage1' }, (errStage1, stage1) => {
      Stage.findOne({ name: 'stage2' }, (errStage2, stage2) => {
        StageInstance.findOne({ stage: stage1._id }, (errStageInstance1, stageInstance1) => {
          chai.request(app)
          .put(`/updateStageInstance/${stageInstance1._id.toString()}`)
          .set('Authorization', token)
          .send({ time: 777, finalized: true })
          .end((err, res) => {
            StageInstance.findOne({ stage: stage1._id }, (errUpdatedStageInstance1, updatedStageInstance1) => {
              GameInstance.findOne({ game: game1._id }, (errGameInstance1, gameInstance1) => {
                updatedStageInstance1._id.toString().should.equal(stageInstance1._id.toString())
                updatedStageInstance1.finalized.should.equal(true)
                updatedStageInstance1.score.should.equal(0)
                updatedStageInstance1.time.should.equal(777)
                gameInstance1.score.should.equal(0)
                gameInstance1.finalized.should.equal(false)
                res.body.stage.toString().should.equal(stage2._id.toString())
                res.body.finalized.should.equal(false)
                res.status.should.equal(200)
                done()
              })
            })
          })
        })
      })
    })
  })
}

function updatesHintsUsedAndTime (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    Stage.findOne({ name: 'stage2' }, (errStage2, stage2) => {
      StageInstance.findOne({ stage: stage2._id }, (errStageInstance2, stageInstance2) => {
        Hint.findOne({ text: 'hint1' }, (errHint1, hint1) => {
          chai.request(app)
          .put(`/updateStageInstance/${stageInstance2._id.toString()}`)
          .set('Authorization', token)
          .send({ time: 304, hintsUsed: [hint1._id.toString()] })
          .end((err, res) => {
            StageInstance.findOne({ stage: stage2._id }, (errUpdatedStageInstance2, updatedStageInstance2) => {
              GameInstance.findOne({ game: game1._id }, (errGameInstance1, gameInstance1) => {
                updatedStageInstance2._id.toString().should.equal(stageInstance2._id.toString())
                updatedStageInstance2.finalized.should.equal(false)
                updatedStageInstance2.score.should.equal(0)
                updatedStageInstance2.time.should.equal(304)
                updatedStageInstance2.hintsUsed.should.include(hint1._id.toString())
                gameInstance1.score.should.equal(0)
                gameInstance1.finalized.should.equal(false)
                res.body.stage.toString().should.equal(stage2._id.toString())
                res.body.finalized.should.equal(false)
                res.body.hintsUsed.should.include(hint1._id.toString())
                res.status.should.equal(200)
                done()
              })
            })
          })
        })
      })
    })
  })
}

function updatesAnswersAndTimeForWrongAnswers (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    Stage.findOne({ name: 'stage2' }, (errStage2, stage2) => {
      StageInstance.findOne({ stage: stage2._id }, (errStageInstance2, stageInstance2) => {
        Hint.findOne({ text: 'hint1' }, (errHint1, hint1) => {
          chai.request(app)
          .put(`/updateStageInstance/${stageInstance2._id.toString()}`)
          .set('Authorization', token)
          .send({ time: 405, answers: ['wrong'] })
          .end((err, res) => {
            StageInstance.findOne({ stage: stage2._id }, (errUpdatedStageInstance2, updatedStageInstance2) => {
              GameInstance.findOne({ game: game1._id }, (errGameInstance1, gameInstance1) => {
                updatedStageInstance2._id.toString().should.equal(stageInstance2._id.toString())
                updatedStageInstance2.finalized.should.equal(false)
                updatedStageInstance2.score.should.equal(0)
                updatedStageInstance2.time.should.equal(405)
                updatedStageInstance2.answers.toString().should.include('wrong')
                updatedStageInstance2.hintsUsed.should.include(hint1._id.toString())
                gameInstance1.score.should.equal(0)
                gameInstance1.finalized.should.equal(false)
                res.body.stage.toString().should.equal(stage2._id.toString())
                res.body.finalized.should.equal(false)
                res.body.hintsUsed.should.include(hint1._id.toString())
                res.status.should.equal(200)
                done()
              })
            })
          })
        })
      })
    })
  })
}

function updatesAnswersAndTimeForRightAnswersReturnsNext (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    Stage.findOne({ name: 'stage2' }, (errStage2, stage2) => {
      Stage.findOne({ name: 'stage3' }, (errStage3, stage3) => {
        StageInstance.findOne({ stage: stage2._id }, (errStageInstance2, stageInstance2) => {
          Hint.findOne({ text: 'hint1' }, (errHint1, hint1) => {
            chai.request(app)
            .put(`/updateStageInstance/${stageInstance2._id.toString()}`)
            .set('Authorization', token)
            .send({ time: 455, answers: ['wrong', 'test answer 2'] })
            .end((err, res) => {
              StageInstance.findOne({ stage: stage2._id }, (errUpdatedStageInstance2, updatedStageInstance2) => {
                GameInstance.findOne({ game: game1._id }, (errGameInstance1, gameInstance1) => {
                  updatedStageInstance2._id.toString().should.equal(stageInstance2._id.toString())
                  updatedStageInstance2.finalized.should.equal(true)
                  Math.ceil(updatedStageInstance2.score).should.equal(34)
                  updatedStageInstance2.time.should.equal(455)
                  updatedStageInstance2.answers.toString().should.include('wrong')
                  updatedStageInstance2.answers.toString().should.include('test answer 2')
                  updatedStageInstance2.hintsUsed.should.include(hint1._id.toString())
                  Math.ceil(gameInstance1.score).should.equal(34)
                  gameInstance1.finalized.should.equal(false)
                  res.body.stage.toString().should.equal(stage3._id.toString())
                  res.body.finalized.should.equal(false)
                  res.body.hintsUsed.length.should.equal(0)
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
}

function updatesAnswersAndTimeForRightAnswersReturnsGameInstance (app, token, done) {
  Game.findOne({ name: 'game1' }, (errGame1, game1) => {
    Stage.findOne({ name: 'stage3' }, (errStage3, stage3) => {
      StageInstance.findOne({ stage: stage3._id }, (errStageInstance3, stageInstance3) => {
        chai.request(app)
        .put(`/updateStageInstance/${stageInstance3._id.toString()}`)
        .set('Authorization', token)
        .send({ time: 20, answers: ['test answer 3'] })
        .end((err, res) => {
          StageInstance.findOne({ stage: stage3._id }, (errUpdatedStageInstance3, updatedStageInstance3) => {
            GameInstance.findOne({ game: game1._id }, (errGameInstance1, gameInstance1) => {
              User.findOne({ name: 'test' }, (errTest1, test1) => {
                User.findOne({ name: 'test2' }, (errTest2, test2) => {
                  User.findOne({ name: 'test3' }, (errTest3, test3) => {
                    User.findOne({ name: 'test4' }, (errTest4, test4) => {
                      updatedStageInstance3._id.toString().should.equal(stageInstance3._id.toString())
                      updatedStageInstance3.finalized.should.equal(true)
                      Math.ceil(updatedStageInstance3.score).should.equal(27)
                      updatedStageInstance3.time.should.equal(20)
                      updatedStageInstance3.answers.toString().should.include('test answer 3')
                      updatedStageInstance3.hintsUsed.length.should.equal(0)
                      Math.ceil(gameInstance1.score).should.equal(60)
                      gameInstance1.finalized.should.equal(true)
                      test1.gamesFinished.should.include(gameInstance1._id.toString())
                      test2.gamesFinished.should.include(gameInstance1._id.toString())
                      test3.gamesFinished.should.include(gameInstance1._id.toString())
                      test1.gamesInProgress.length.should.equal(0)
                      test2.gamesInProgress.length.should.equal(0)
                      test3.gamesInProgress.length.should.equal(0)
                      test4.gamesInProgress.length.should.equal(0)
                      test4.gamesFinished.length.should.equal(0)
                      Math.ceil(test1.scores[0]).should.equal(60)
                      Math.ceil(test2.scores[0]).should.equal(60)
                      Math.ceil(test3.scores[0]).should.equal(60)
                      res.body._id.toString().should.equal(gameInstance1._id.toString())
                      res.body.finalized.should.equal(true)
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
  })
}

function updatesWithDeductionForWrongAnswer (app, token, done) {
  Game.findOne({ name: 'game2' }, (errGame2, game2) => {
    User.findOne({ name: 'test4' }, (errTest4, test4) => {
      chai.request(app)
      .post('/createGameInstance')
      .set('Authorization', token)
      .send({ game: game2, team: [test4._id] })
      .end((errCreateGameInstance, resCreateGameInstance) => {
        Stage.findOne({ name: 'stage4' }, (errStage4, stage4) => {
          StageInstance.findOne({ stage: stage4._id }, (errStageInstance4, stageInstance4) => {
            chai.request(app)
            .put(`/updateStageInstance/${stageInstance4._id.toString()}`)
            .set('Authorization', token)
            .send({ time: 157, answers: ['wrong'] })
            .end((errWrong, resWrong) => {
              chai.request(app)
              .put(`/updateStageInstance/${stageInstance4._id.toString()}`)
              .set('Authorization', token)
              .send({ time: 209, answers: ['wrong', 'test answer 4'] })
              .end((err, res) => {
                StageInstance.findOne({ stage: stage4._id }, (errUpdatedStageInstance4, updatedStageInstance4) => {
                  GameInstance.findOne({ game: game2._id }, (errGameInstance2, gameInstance2) => {
                    User.findOne({ name: 'test' }, (errTest1, test1) => {
                      User.findOne({ name: 'test4' }, (errTest4, test4) => {
                        Stage.findOne({ name: 'stage5' }, (errStage5, stage5) => {
                          StageInstance.findOne({ stage: stage5._id }, (errStageInstance5, stageInstance5) => {
                            updatedStageInstance4._id.toString().should.equal(stageInstance4._id.toString())
                            updatedStageInstance4.finalized.should.equal(true)
                            Math.ceil(updatedStageInstance4.score).should.equal(40)
                            updatedStageInstance4.time.should.equal(209)
                            updatedStageInstance4.answers.toString().should.include('wrong')
                            updatedStageInstance4.answers.toString().should.include('test answer 4')
                            updatedStageInstance4.hintsUsed.length.should.equal(0)
                            Math.ceil(gameInstance2.score).should.equal(40)
                            gameInstance2.finalized.should.equal(false)
                            test1.gamesInProgress.length.should.equal(1)
                            test1.gamesFinished.length.should.equal(1)
                            test4.gamesInProgress.length.should.equal(1)
                            test4.gamesFinished.length.should.equal(0)
                            res.body._id.toString().should.equal(stageInstance5._id.toString())
                            res.body.finalized.should.equal(false)
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
        })
      })
    })
  })
}

function updatesWithDeductionForHintUsed (app, token, done) {
  Game.findOne({ name: 'game2' }, (errGame2, game2) => {
    Stage.findOne({ name: 'stage5' }, (errStage5, stage5) => {
      StageInstance.findOne({ stage: stage5._id }, (errStageInstance5, stageInstance5) => {
        Hint.findOne({ text: 'hint3' }, (errHint3, hint3) => {
          chai.request(app)
          .put(`/updateStageInstance/${stageInstance5._id.toString()}`)
          .set('Authorization', token)
          .send({ time: 2001, hintsUsed: [hint3._id.toString()] })
          .end((err, res) => {
            chai.request(app)
            .put(`/updateStageInstance/${stageInstance5._id.toString()}`)
            .set('Authorization', token)
            .send({ time: 2001, answers: ['test answer 5'] })
            .end((err, res) => {
              StageInstance.findOne({ stage: stage5._id }, (errUpdatedStageInstance5, updatedStageInstance5) => {
                GameInstance.findOne({ game: game2._id }, (errGameInstance2, gameInstance2) => {
                  User.findOne({ name: 'test' }, (errTest1, test1) => {
                    User.findOne({ name: 'test4' }, (errTest4, test4) => {
                      updatedStageInstance5._id.toString().should.equal(stageInstance5._id.toString())
                      updatedStageInstance5.finalized.should.equal(true)
                      Math.ceil(updatedStageInstance5.score).should.equal(35)
                      updatedStageInstance5.time.should.equal(2001)
                      updatedStageInstance5.answers.toString().should.include('test answer 5')
                      updatedStageInstance5.hintsUsed.length.should.equal(1)
                      updatedStageInstance5.hintsUsed.should.include(hint3._id.toString())
                      Math.ceil(gameInstance2.score).should.equal(75)
                      gameInstance2.finalized.should.equal(true)
                      test1.gamesFinished.should.include(gameInstance2._id.toString())
                      test4.gamesFinished.should.include(gameInstance2._id.toString())
                      test1.gamesInProgress.length.should.equal(0)
                      test4.gamesInProgress.length.should.equal(0)
                      Math.ceil(test1.scores[1]).should.equal(75)
                      Math.ceil(test1.scores[0]).should.equal(60)
                      Math.ceil(test4.scores[0]).should.equal(75)
                      res.body._id.toString().should.equal(gameInstance2._id.toString())
                      res.body.finalized.should.equal(true)
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
  })
}

export default {
  cannotUpdateIfLoggedOut,
  cannotUpdateWithBadToken,
  cannotUpdateWithBadId,
  nonConductorCannotUpdate,
  cannotUpdateWithBadAttributes,
  updatesFinalizedAndTimeAndReturnsNextStageInstance,
  updatesHintsUsedAndTime,
  updatesAnswersAndTimeForWrongAnswers,
  updatesAnswersAndTimeForRightAnswersReturnsNext,
  updatesAnswersAndTimeForRightAnswersReturnsGameInstance,
  updatesWithDeductionForWrongAnswer,
  updatesWithDeductionForHintUsed,
}
