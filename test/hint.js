// imports
import chai from 'chai'
import Hint from '../models/hint'
import Stage from '../models/stage'

// chai tools
const expect = chai.expect
const should = chai.should()

function cannotCreateIfLoggedOut (app, done) {
  Stage.find({}, (errStage, stages) => {
    chai.request(app)
    .post('/createHint')
    .send({ stage: stages[0], text: 'test' })
    .end((err, res) => {
      Hint.find({ stage: stages[0] }, (errHint, hints) => {
        hints.length.should.equal(0)
        err.response.text.should.equal('Unauthorized')
        res.should.have.status(401)
        done()
      })
    })
  })
}

function cannotCreateWithBadToken (app, done) {
  Stage.find({}, (errStage, stages) => {
    chai.request(app)
    .post('/createHint')
    .set('Authorization', 'badToken')
    .send({ stage: stages[0], text: 'test' })
    .end((err, res) => {
      Hint.find({ stage: stages[0] }, (errHint, hints) => {
        hints.length.should.equal(0)
        err.response.text.should.equal('Unauthorized')
        res.should.have.status(401)
        done()
      })
    })
  })
}

function cannotCreateIfNoStage (app, token, done) {
  chai.request(app)
  .post('/createHint')
  .set('Authorization', token)
  .send({ text: 'test' })
  .end((err, res) => {
    Hint.find({ text: 'test' }, (errHint, hints) => {
      res.text.should.equal('An error occurred! Please check your payload!')
      should.equal(err, null)
      hints.length.should.equal(0)
      res.should.have.status(200)
      done()
    })
  })
}

function cannotCreateIfNoText (app, token, done) {
  Stage.find({}, (errStage, stages) => {
    chai.request(app)
    .post('/createHint')
    .set('Authorization', token)
    .send({ stage: stages[0] })
    .end((err, res) => {
      Hint.find({ stage: stages[0] }, (errHint, hints) => {
        err.should.not.equal(null)
        hints.length.should.equal(0)
        res.should.have.status(500)
        done()
      })
    })
  })
}

function cannotCreateWithBadStage (app, token, done) {
  chai.request(app)
  .post('/createHint')
  .set('Authorization', token)
  .send({ stage: 'badStage', text: 'test' })
  .end((err, res) => {
    Hint.find({}, (errHint, hints) => {
      res.text.should.equal('An error occurred! Please check your payload!')
      should.equal(err, null)
      hints.length.should.equal(0)
      res.should.have.status(200)
      done()
    })
  })
}

function createsIfAllGood (app, token, done) {
  Stage.find({}, (errStage, stages) => {
    chai.request(app)
    .post('/createHint')
    .set('Authorization', token)
    .send({ stage: stages[0], text: 'test' })
    .end((err, res) => {
      Stage.find({}, (errUpdatedStage, updatedStages) => {
        Hint.find({ stage: stages[0] }, (errHint, hints) => {
          should.equal(err, null)
          hints.length.should.equal(1)
          updatedStages[0].hints[updatedStages[0].hints.length - 1].toString().should.equal(hints[0]._id.toString())
          res.should.have.status(200)
          done()
        })
      })
    })
  })
}

function cannotDestroyIfNone (app, token, done) {
  chai.request(app)
  .delete('/destroyHint/nonExistentHintId')
  .set('Authorization', token)
  .end((err, res) => {
    Hint.find({}, (errHint, hints) => {
      err.should.not.equal(null)
      hints.length.should.equal(1)
      res.should.have.status(500)
      done()
    })
  })
}

function cannotDestroyWithBadToken (app, done) {
  chai.request(app)
  .delete('/destroyHint/hintTest')
  .set('Authorization', 'badToken')
  .end((err, res) => {
    Hint.find({}, (errHint, hints) => {
      hints.length.should.equal(1)
      err.response.text.should.equal('Unauthorized')
      res.should.have.status(401)
      done()
    })
  })
}

function destroysWithNoTrace (app, token, done) {
  Hint.find({}, (errHint, hints) => {
    chai.request(app)
    .delete(`/destroyHint/${hints[0]._id.toString()}`)
    .set('Authorization', token)
    .end((err, res) => {
      Hint.find({}, (errUpdatedHint, updatedHints) => {
        Stage.find({}, (errStage, stages) => {
          should.equal(err, null)
          updatedHints.length.should.equal(0)
          stages[0].hints.length.should.equal(0)
          res.should.have.status(200)
          done()
        })
      })
    })
  })
}

function noHintIfStageDestroyed (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageToBeDestroyedForHint', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((errFirstRequest, resFirstRequest) => {
    Stage.find({ name: 'stageToBeDestroyedForHint' }, (errStage, stages) => {
      chai.request(app)
      .post('/createHint')
      .set('Authorization', token)
      .send({ stage: stages[0], text: 'testToBeDestroyed1' })
      .end((errSecondRequest, resSecondRequest) => {
        chai.request(app)
        .post('/createHint')
        .set('Authorization', token)
        .send({ stage: stages[0], text: 'testToBeDestroyed2' })
        .end((errThirdRequest, resThirdRequest) => {
          chai.request(app)
          .delete('/destroyStage/stageToBeDestroyedForHint')
          .set('Authorization', token)
          .end((err, res) => {
            Hint.find({}, (errHint, hints) => {
              should.equal(err, null)
              hints.length.should.equal(0)
              res.should.have.status(200)
              done()
            })
          })
        })
      })
    })
  })
}

function cannotUpdateWithBadToken (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageToUsedForUpdateTests', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((errFirstRequest, resFirstRequest) => {
    Stage.find({ name: 'stageToUsedForUpdateTests' }, (errStage, stages) => {
      chai.request(app)
      .post('/createHint')
      .set('Authorization', token)
      .send({ stage: stages[0], text: 'testToBeUpdated' })
      .end((errSecondRequest, resSecondRequest) => {
        Hint.find({ text: 'testToBeUpdated' }, (errHint, hints) => {
          chai.request(app)
          .put(`/updateHint/${hints[0].id}`)
          .set('Authorization', 'badToken')
          .send({ text: 'testToBeUpdatedAlreadyUpdated' })
          .end((errThirdRequest, resThirdRequest) => {
            Hint.find({ text: 'testToBeUpdatedAlreadyUpdated' }, (errUpdatedHint, updatedHints) => {
              Stage.remove({}, (errDeleteAllStages, allStages) => {
                Hint.remove({}, (errDeleteAllHints, allHints) => {
                  hints.length.should.equal(1)
                  updatedHints.length.should.equal(0)
                  resThirdRequest.should.have.status(401)
                  errThirdRequest.response.text.should.equal('Unauthorized')
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

function cannotUpdateWithBadId (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageToUsedForUpdateTests', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((errFirstRequest, resFirstRequest) => {
    Stage.find({ name: 'stageToUsedForUpdateTests' }, (errStage, stages) => {
      chai.request(app)
      .post('/createHint')
      .set('Authorization', token)
      .send({ stage: stages[0], text: 'testToBeUpdated' })
      .end((errSecondRequest, resSecondRequest) => {
        Hint.find({ text: 'testToBeUpdated' }, (errHint, hints) => {
          chai.request(app)
          .put(`/updateHint/badId`)
          .set('Authorization', token)
          .send({ text: 'testToBeUpdatedAlreadyUpdated' })
          .end((errThirdRequest, resThirdRequest) => {
            Hint.find({ text: 'testToBeUpdatedAlreadyUpdated' }, (errUpdatedHint, updatedHints) => {
              Stage.remove({}, (errDeleteAllStages, allStages) => {
                Hint.remove({}, (errDeleteAllHints, allHints) => {
                  hints.length.should.equal(1)
                  updatedHints.length.should.equal(0)
                  resThirdRequest.should.have.status(500)
                  errThirdRequest.response.should.not.equal(null)
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

function updatesIfAllGood (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageToUsedForUpdateTests', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((errFirstRequest, resFirstRequest) => {
    Stage.find({ name: 'stageToUsedForUpdateTests' }, (errStage, stages) => {
      chai.request(app)
      .post('/createHint')
      .set('Authorization', token)
      .send({ stage: stages[0], text: 'testToBeUpdated' })
      .end((errSecondRequest, resSecondRequest) => {
        Hint.find({ text: 'testToBeUpdated' }, (errHint, hints) => {
          chai.request(app)
          .put(`/updateHint/${hints[0].id}`)
          .set('Authorization', token)
          .send({ text: 'testToBeUpdatedAlreadyUpdated' })
          .end((errThirdRequest, resThirdRequest) => {
            Hint.find({ text: 'testToBeUpdatedAlreadyUpdated' }, (errUpdatedHint, updatedHints) => {
              Stage.remove({}, (errDeleteAllStages, allStages) => {
                Hint.remove({}, (errDeleteAllHints, allHints) => {
                  hints.length.should.equal(1)
                  updatedHints.length.should.equal(1)
                  resThirdRequest.should.have.status(200)
                  should.equal(errThirdRequest, null)
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

function cannotReadWithBadToken (app, token, done) {
  chai.request(app)
  .post('/createStage')
  .set('Authorization', token)
  .send({ name: 'stageToUsedForReadTests', content: 'test content', instructions: 'test instructions', answer: 'test answer' })
  .end((errFirstRequest, resFirstRequest) => {
    Stage.find({ name: 'stageToUsedForReadTests' }, (errStage, stages) => {
      chai.request(app)
      .post('/createHint')
      .set('Authorization', token)
      .send({ stage: stages[0], text: 'testToBeRead' })
      .end((errSecondRequest, resSecondRequest) => {
        Hint.find({ text: 'testToBeRead' }, (errHint, hints) => {
          chai.request(app)
          .get(`/readHint/${hints[0].id}`)
          .set('Authorization', 'badToken')
          .end((errThirdRequest, resThirdRequest) => {
            hints.length.should.equal(1)
            resThirdRequest.should.have.status(401)
            errThirdRequest.response.text.should.equal('Unauthorized')
            done()
          })
        })
      })
    })
  })
}

function cannotReadWithNoHint (app, token, done) {
  Hint.find({ text: 'testToBeRead' }, (errHint, hints) => {
    chai.request(app)
    .get(`/readHint/badId`)
    .set('Authorization', token)
    .end((err, res) => {
      hints.length.should.equal(1)
      res.should.have.status(401)
      err.response.should.not.equal(null)
      done()
    })
  })
}

function readsIfAllGood (app, token, done) {
  Hint.find({ text: 'testToBeRead' }, (errHint, hints) => {
    chai.request(app)
    .get(`/readHint/${hints[0].id}`)
    .set('Authorization', token)
    .end((err, res) => {
      Stage.remove({}, (errDeleteAllStages, allStages) => {
        Hint.remove({}, (errDeleteAllHints, allHints) => {
          hints.length.should.equal(1)
          res.body.stage.toString().should.equal(hints[0].stage.toString())
          res.body.text.should.equal(hints[0].text)
          res.should.have.status(200)
          should.equal(err, null)
          done()
        })
      })
    })
  })
}

export default {
  cannotCreateIfLoggedOut,
  cannotCreateWithBadToken,
  cannotCreateIfNoStage,
  cannotCreateIfNoText,
  cannotCreateWithBadStage,
  createsIfAllGood,
  cannotDestroyIfNone,
  cannotDestroyWithBadToken,
  destroysWithNoTrace,
  noHintIfStageDestroyed,
  cannotUpdateWithBadToken,
  cannotUpdateWithBadId,
  updatesIfAllGood,
  cannotReadWithBadToken,
  cannotReadWithNoHint,
  readsIfAllGood,
}
