import User from '../models/user'

const IMMUTABLE_PROPERTIES = ['_id', 'password', 'averageTeamScore', 'gamesCreated', 'stagesCreated', 'gamesInProgress', 'gamesFinished']

function read (req, res, next) {
  User.findOne({ name: req.params.name }, (err, user) => {
    if (err) { return res.status(401).send(err.response) }
    if (!user) { return res.status(200).send('No users found under that name.') }
    const userCopy = user.toObject()
    delete userCopy['email']
    delete userCopy['password']
    res.send(userCopy)
  })
}

function update (req, res, next) {
  if (req.user.name !== req.params.name) { return res.send('You do not have the permission to do this!') }
  IMMUTABLE_PROPERTIES.forEach(disallowedProp => {
  	for (let _key in req.body) {
  		delete req.body[disallowedProp]
  	}
  })
  User.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true }, (err, user) => {
    if (err) { return res.status(500).send(err) }
    res.send(user)
  })
}

function destroy (req, res, next) {
  // TODO: build out this function - maybe there will be no option to destroy account for now
  res.send('xD /destroyUser ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  read,
  update,
  destroy,
}
