import mongoose from 'mongoose'
import User from './user'
import Stage from './stage'

const GameSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  description: { type: String, default: '' },
  stages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  averageCompletionTime: { type: Number, default: 0 },
  ratings: [{ type: Object }],
  requirements: { type: String, default: '' },
})

// after save, save the game id in user document
GameSchema.post('save', (game, next) => {
  User.update({ _id: game.author }, { '$push': { 'gamesCreated': game } }, (err, user) => {
    if (err) { return next(err) }
    next()
  })
})

// after destroy, remove the game id from user document
GameSchema.post('remove', (game, next) => {
  // TODO: when we delete a game, we must replace the corresponding id in gameInstances with a symbol that
  // denotes 'deleted by author'
  User.update({ _id: game.author }, { '$pull': { 'gamesCreated': game._id } }, (err, user) => {
    if (err) { return next(err) }
    Stage.update({ createdThroughGame: game }, { '$set': { 'createdThroughGame': null } }, { multi: true }, (errStage, stage) => {
      if (errStage) {
        return next(errStage)
      }
      next()
    })
  })
})

const Game = mongoose.model('Game', GameSchema)

export default Game
