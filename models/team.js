import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

const TeamSchema = mongoose.Schema({
	name: {type : String, unique : true, required : true},
  password: {type : String, required : true},
  gameOneStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  gameTwoStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  gameThreeStages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  score: {type : Number, default: 0},
  finalized: {type : Boolean, default: false},
})

// before save, encrypt pw
TeamSchema.pre('save', function(next) {
  // get team model
  const team = this
  // generate salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    // encrypt pw using generated salt in this callback (after salt is generated)
    bcrypt.hash(team.password, salt, null, (err, hash) => {
      if (err) { return next(err) }
      // replace pw with encrypted pw
      team.password = hash
      next()
    })
  })
})

TeamSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err) }
    callback(null, isMatch)
  })
}

const Team = mongoose.model('Team', TeamSchema)

export default Team
