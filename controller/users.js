import User from '../models/user'

function read (req, res, next) {
  // TODO: build out this function
  res.send('xD /readUser ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
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
