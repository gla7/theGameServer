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

// before save, save the game id in user document
GameSchema.pre('save', function(next) {
  // get game model
  const game = this
  User.update({ _id: game.author }, { '$push': { 'gamesCreated': game } }, (err, user) => {
    if (err) { return next(err) }
    next()
  })
})

const Game = mongoose.model('Game', GameSchema)

export default Game
