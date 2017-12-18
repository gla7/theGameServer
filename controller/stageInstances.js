import StageInstance from '../models/stageInstance'
import GameInstance from '../models/gameInstance'
import Stage from '../models/stage'
import Hint from '../models/hint'
import User from '../models/user'

function read (req, res, next) {
  // TODO: build out this function
  res.send('xD /readStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createStageInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function update (req, res, next) {
  StageInstance.findOne({ _id: req.params.id }, (errStageInstance, stageInstance) => {
    if (errStageInstance) { return next(errStageInstance) }
    if (!stageInstance) { return res.send('No stage instance under that id.') }
    GameInstance.findOne({ _id: stageInstance.gameInstance }, (errGameInstance, gameInstance) => {
      if (errGameInstance) { return next(errGameInstance) }
      if (req.user._id.toString() !== gameInstance.conductor.toString()) { return res.send('You do not have the permission to do this.') }
      if (Object.keys(req.body).length === 2 && req.body.hasOwnProperty('hintsUsed') && req.body.hasOwnProperty('time')) {
        return updateHints(stageInstance.id, req.body.hintsUsed, req.body.time, res, next)
      } else if (Object.keys(req.body).length === 2 && req.body.hasOwnProperty('answers') && req.body.hasOwnProperty('time')) {
        return checkAnswer(stageInstance.id, req.body.answers, req.body.time, res, next)
      } else if (Object.keys(req.body).length === 2 && req.body.finalized === true && req.body.hasOwnProperty('time')) {
        return finalizeStageInstanceBecauseOfTime(stageInstance.id, req.body.time, res, next)
      } else {
        return res.send('You may only update two attributes at one time, one of which must be time and the other must be either hintsUsed, answers or finalized.')
      }
    })
  })
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function updateHints (id, hints, time, res, next) {
  StageInstance.findOneAndUpdate({ _id: id }, { hintsUsed: hints, time }, { new: true }, (errStageInstance, stageInstance) => {
    if (errStageInstance) { return next(errStageInstance) }
    return res.send(stageInstance)
  })
}

function checkAnswer (id, answers, time, res, next) {
  StageInstance.findOne({ _id: id }, (errStageInstance, stageInstance) => {
    if (errStageInstance) { return next(errStageInstance) }
    Stage.findOne({ _id: stageInstance.stage }, (errStage, stage) => {
      if (errStage) { return next(errStage) }
      if (stage.answer.toString().toLowerCase() === answers[answers.length - 1].toString().toLowerCase()) {
        return calculateScoreAndGoToNextStageOrEndGameInstance(stage, stageInstance, stageInstance.gameInstance, answers, time, res, next)
      } else {
        StageInstance.findOneAndUpdate({ _id: id }, { time, answers }, { new: true }, (errUpdatedStageInstance, updatedStageInstance) => {
          if (errUpdatedStageInstance) { return next(errUpdatedStageInstance) }
          return res.send(updatedStageInstance)
        })
      }
    })
  })
}

function calculateScoreAndGoToNextStageOrEndGameInstance (stage, stageInstance, gameInstanceId, answers, time, res, next) {
  GameInstance.findOne({ _id: gameInstanceId }, (errGameInstance, gameInstance) => {
    if (errGameInstance) { return next(errGameInstance) }
    const totalValueOfStage = 100/gameInstance.stages.length
    let percentageDeductionPerWrongAnswer = 0
    if (stage.percentageDeductionPerWrongAnswer > 100) {
      percentageDeductionPerWrongAnswer = 1
    } else if (stage.percentageDeductionPerWrongAnswer < 0) {
      percentageDeductionPerWrongAnswer = 0
    } else {
      percentageDeductionPerWrongAnswer = stage.percentageDeductionPerWrongAnswer * 0.01
    }
    const totalDeductionForWrongAnswers = (totalValueOfStage * (stageInstance.answers.length * percentageDeductionPerWrongAnswer))
    const totalDeductionForTimeTaken = stage.timeUntilOneTenthDeduction <= 0 ? 0 : (totalValueOfStage * ((time / stage.timeUntilOneTenthDeduction) * 0.1))
    if (stageInstance.hintsUsed.length > 0) {
      Hint.find({ $or: stageInstance.hintsUsed.map(hint => { return { _id: hint } }) }, (errHints, hints) => {
        if (errHints) { return next(errHints) }
        let totalPercentageDeductionForHintsUsed = 0
        hints.map(hint => {
          totalPercentageDeductionForHintsUsed += hint.percentDeductionIfUsed * 0.01
        })
        const totalDeductionForHintsUsed = (totalValueOfStage * totalPercentageDeductionForHintsUsed)
        const stageFinalScore = (totalValueOfStage - totalDeductionForWrongAnswers - totalDeductionForTimeTaken - totalDeductionForHintsUsed < 0) ? 0 : totalValueOfStage - totalDeductionForWrongAnswers - totalDeductionForTimeTaken - totalDeductionForHintsUsed
        StageInstance.findOneAndUpdate(
          { _id: stageInstance._id },
          {
            answers,
            time,
            score: stageFinalScore,
            finalized: true
          },
          { new: true },
          (errUpdatedStageInstance, updatedStageInstance) => {
            if (errUpdatedStageInstance) { return next(errUpdatedStageInstance) }
            return goToNextStageOrEndGameInstance(updatedStageInstance.score, stage._id, gameInstanceId, res, next)
          }
        )
      })
    } else {
      const totalDeductionForHintsUsed = 0
      const stageFinalScore = (totalValueOfStage - totalDeductionForWrongAnswers - totalDeductionForTimeTaken - totalDeductionForHintsUsed < 0) ? 0 : totalValueOfStage - totalDeductionForWrongAnswers - totalDeductionForTimeTaken - totalDeductionForHintsUsed
      StageInstance.findOneAndUpdate(
        { _id: stageInstance._id },
        {
          answers,
          time,
          score: stageFinalScore,
          finalized: true
        },
        { new: true },
        (errUpdatedStageInstance, updatedStageInstance) => {
          if (errUpdatedStageInstance) { return next(errUpdatedStageInstance) }
          return goToNextStageOrEndGameInstance(updatedStageInstance.score, stage._id, gameInstanceId, res, next)
        }
      )
    }
  })
}

function finalizeStageInstanceBecauseOfTime (id, time, res, next) {
  StageInstance.findOneAndUpdate({ _id: id }, { time, finalized: true }, { new: true }, (errStageInstance, stageInstance) => {
    if (errStageInstance) { return next(errStageInstance) }
    return goToNextStageOrEndGameInstance(0, stageInstance.stage, stageInstance.gameInstance, res, next)
  })
}

function goToNextStageOrEndGameInstance (stageScore, stage, gameInstanceId, res, next) {
  GameInstance.findOne({ _id: gameInstanceId }, (errGameInstanceFound, gameInstanceFound) => {
    if (errGameInstanceFound) { return next(errGameInstanceFound) }
    const currentGameScore = gameInstanceFound.score
    GameInstance.findOneAndUpdate(
      { _id: gameInstanceId },
      { score: (currentGameScore + stageScore) },
      { new: true },
      (errGameInstance, gameInstance) => {
        if (errGameInstance) { return next(errGameInstance) }
        if ((gameInstance.stages.length - 1) === indexOf(stage, gameInstance.stages)) {
          GameInstance.findOneAndUpdate({ _id: gameInstanceId }, { finalized: true }, { new: true }, (errFinalizedGameInstance, finalizedGameInstance) => {
            if (errFinalizedGameInstance) { return next(errFinalizedGameInstance) }
            User.update(
              { $or: finalizedGameInstance.team.map(member => { return { _id: member } }).concat({ _id: finalizedGameInstance.conductor }) },
              { '$pull': { 'gamesInProgress': finalizedGameInstance._id } },
              { multi: true },
              (errUsers, users) => {
                if (errUsers) { return next(errUsers) }
                User.update(
                  { $or: finalizedGameInstance.team.map(member => { return { _id: member } }).concat({ _id: finalizedGameInstance.conductor }) },
                  { '$push': { 'gamesFinished': finalizedGameInstance._id } },
                  { multi: true },
                  (errSecondUpdateUsers, secondUpdateUsers) => {
                    if (errSecondUpdateUsers) { return next(errSecondUpdateUsers) }
                    User.update(
                      { $or: finalizedGameInstance.team.map(member => { return { _id: member } }).concat({ _id: finalizedGameInstance.conductor }) },
                      { '$push': { 'scores': finalizedGameInstance.score } },
                      { multi: true },
                      (errThirdUpdateUsers, thirdUpdateUsers) => {
                        if (errThirdUpdateUsers) { return next(errThirdUpdateUsers) }
                        return res.send(finalizedGameInstance)
                      }
                    )
                  }
                )
              }
            )
          })
        } else {
          Stage.findOne({ _id: gameInstance.stages[indexOf(stage, gameInstance.stages) + 1] }, (errNextStage, nextStage) => {
            if (errNextStage) { return next(errNextStage) }
            StageInstance.findOne({ gameInstance: gameInstanceId, stage: nextStage._id }, (errNextStageInstance, nextStageInstance) => {
              if (errNextStageInstance) { return next(errNextStageInstance) }
              return res.send(nextStageInstance)
            })
          })
        }
      }
    )
  })
}

function indexOf (item, array) {
	let index = -1
	array.map((element, elementIndex) => {
		if (item.toString() === element.toString()) {
			index = elementIndex
		}
	})
	return index
}

export default {
  read,
  create,
  update,
  destroy,
}
