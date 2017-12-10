import mongoose from 'mongoose'

const StageInstanceSchema = mongoose.Schema({
  gameInstance: { type: mongoose.Schema.Types.ObjectId, ref: 'GameInstances' },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stages' },
  hintsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hints' }],
  score: { type: Number, default: 0 },
  answers: [{ type: String }],
  time: { type: Number, default: 0 },
  finalized: { type: Boolean, default: false },
})

const StageInstance = mongoose.model('StageInstance', StageInstanceSchema)

export default StageInstance
