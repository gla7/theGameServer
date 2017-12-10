import mongoose from 'mongoose'

const HintSchema = mongoose.Schema({
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stages' },
  percentDeductionIfUsed: { type: Number, default: 0 },
})

const Hint = mongoose.model('Hint', HintSchema)

export default Hint
