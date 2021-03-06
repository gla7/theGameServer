import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

const UserSchema = mongoose.Schema({
	name: { type: String, unique: true, required: true },
  email: { type: String, unique:true, required: true },
  password: { type: String, required : true },
  scores: [{ type: Number }],
  gamesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Games' }],
  stagesCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  gamesInProgress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameInstances' }],
  gamesFinished: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GameInstances' }],
})

// before save, encrypt pw
UserSchema.pre('save', function(next) {
  // get user model
  const user = this
  // generate salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err) }
    // encrypt pw using generated salt in this callback (after salt is generated)
    bcrypt.hash(user.password, salt, null, (errHash, hash) => {
      if (errHash) { return next(errHash) }
      // replace pw with encrypted pw
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) { return callback(err) }
    callback(null, isMatch)
  })
}

const User = mongoose.model('User', UserSchema)

export default User
