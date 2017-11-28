import mongoose from 'mongoose'

const TeamSchema = mongoose.Schema({
	name: {type : String, unique : true, required : true},
  password: {type : String, required : true},
  gameOneStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  gameTwoStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  gameThreeStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  score: {type : Number, default: 0},
  finalized: {type : Boolean, default: false},
})

const Team = mongoose.model('Team', TeamSchema)

export default Team
