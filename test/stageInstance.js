// imports
import chai from 'chai'
import StageInstance from '../models/stageInstance'

// chai tools
const expect = chai.expect
const should = chai.should()

function cannotUpdateIfLoggedOut (app, done) {
  // TODO: build out this function
  done()
}

function cannotUpdateWithBadToken (app, done) {
  // TODO: build out this function
  done()
}

function cannotUpdateWithBadId (app, token, done) {
  // TODO: build out this function
  done()
}

function nonConductorCannotUpdate (app, done) {
  // TODO: build out this function
  done()
}

function cannotUpdateWithBadAttributes (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesHintsUsedAndTime (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesFinalizedAndTimeAndReturnsNextStageInstance (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesFinalizedAndTimeAndReturnsGameInstance (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesAnswersAndTimeForWrongAnswers (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesAnswersAndTimeForRightAnswersReturnsNext (app, token, done) {
  // TODO: build out this function
  done()
}

function updatesAnswersAndTimeForRightAnswersReturnsGameInstance (app, token, done) {
  // TODO: build out this function
  done()
}

export default {
  cannotUpdateIfLoggedOut,
  cannotUpdateWithBadToken,
  cannotUpdateWithBadId,
  nonConductorCannotUpdate,
  cannotUpdateWithBadAttributes,
  updatesHintsUsedAndTime,
  updatesFinalizedAndTimeAndReturnsNextStageInstance,
  updatesFinalizedAndTimeAndReturnsGameInstance,
  updatesAnswersAndTimeForWrongAnswers,
  updatesAnswersAndTimeForRightAnswersReturnsNext,
  updatesAnswersAndTimeForRightAnswersReturnsGameInstance,
}
