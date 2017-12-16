import User from '../models/user'

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
  // TODO: build out this function
  res.send('xD /updateUser ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyUser ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  read,
  update,
  destroy,
}
