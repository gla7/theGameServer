import mongoose from 'mongoose'

const StageSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  content: { type: String, required: true },
  instructions: { type: String, required: true },
  hints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hints' }],
  answer: { type: String, required: true },
  timeUntilOneTenthDeduction: { type: Number, default: -1 },
  requirements: { type: String },
  percentageDeductionPerWrongAnswer: { type: Number, default: 0 },
  ratings: [{ type: Object }],
})

const Stage = mongoose.model('Stage', StageSchema)

export default Stage
