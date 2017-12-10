import User from '../models/user'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadUser ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editUser ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyUser ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  edit,
  destroy,
}
