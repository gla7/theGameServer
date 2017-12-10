import mongoose from 'mongoose'

const GameInstanceSchema = mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Games' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  score: { type: Number, default: 0 },
  stageInstances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StageInstances' }],
  finalized: { type: Boolean, default: false },
})

const GameInstance = mongoose.model('GameInstance', GameInstanceSchema)

export default GameInstance
