import mongoose from 'mongoose'
//testing
import User from './user'
//testing

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
  User.update({ _id: game.author }, { '$pull': { 'gamesCreated': game._id } }, (err, user) => {
    if (err) { return next(err) }
    next()
  })
})

const Game = mongoose.model('Game', GameSchema)

export default Game
