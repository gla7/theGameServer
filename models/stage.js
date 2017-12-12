import mongoose from 'mongoose'
import User from './user'
import Game from './game'

const StageSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  createdThroughGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Games' },
  content: { type: String, required: true },
  instructions: { type: String, required: true },
  hints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hints' }],
  answer: { type: String, required: true },
  timeUntilOneTenthDeduction: { type: Number, default: -1 },
  requirements: { type: String, default: 'Please refer to the instructions.' },
  percentageDeductionPerWrongAnswer: { type: Number, default: 0 },
  ratings: [{ type: Object }],
})

// after save, save the game id in user document and in game document if applicable
StageSchema.post('save', (stage, next) => {
  User.update({ _id: stage.author }, { '$push': { 'stagesCreated': stage } }, (err, user) => {
    if (err) { return next(err) }
    if (stage.createdThroughGame) {
      Game.update({ _id: stage.createdThroughGame }, { '$push': { 'stages': stage } }, (errGame, game) => {
        if (errGame) { return next(errGame) }
        next()
      })
    } else {
      next()
    }
  })
})

// after destroy, remove the stage id from user document and game document if applicable
StageSchema.post('remove', (stage, next) => {
  // TODO: when we delete a stage, we must replace the corresponding id in gameInstances and stageInstances with a symbol that
  // denotes 'deleted by author', also we must delete the associated hints altogether
  User.update({ _id: stage.author }, { '$pull': { 'stagesCreated': stage._id } }, (err, user) => {
    if (err) { return next(err) }
    if (stage.createdThroughGame) {
      Game.update({ stages: stage }, { '$pull': { 'stages': stage._id } }, { multi: true }, (errGame, game) => {
        if (errGame) { return next(errGame) }
        next()
      })
    } else {
      next()
    }
  })
})

const Stage = mongoose.model('Stage', StageSchema)

export default Stage
