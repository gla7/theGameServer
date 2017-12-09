import mongoose from 'mongoose'

const StageSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  number: {type : Number, default: 0},
  points: {type : Number, default: 0},
  time: {type : Number, default: 0},
  hints: {type : Number, default: 0},
  success: {type : Boolean, default: false},
})

const Stage = mongoose.model('Stage', StageSchema)

export default Stage
