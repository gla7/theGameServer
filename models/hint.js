import mongoose from 'mongoose'
import Stage from './stage'

const HintSchema = mongoose.Schema({
  text: { type: String, required: true },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stages', required: true },
  percentDeductionIfUsed: { type: Number, default: 0 },
})

// after save, save the hint id in stage document
HintSchema.post('save', (hint, next) => {
  Stage.update({ _id: hint.stage }, { '$push': { 'hints': hint } }, (err, stage) => {
    if (err) { return next(err) }
    next()
  })
})

// after destroy, remove the hint id from stage document
HintSchema.post('remove', (hint, next) => {
  Stage.update({ _id: hint.stage }, { '$pull': { 'hints': hint._id } }, (err, stage) => {
    if (err) { return next(err) }
    next()
  })
})

const Hint = mongoose.model('Hint', HintSchema)

export default Hint
