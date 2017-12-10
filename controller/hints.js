import Hint from '../models/hint'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadHint ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createHint ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editHint ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyHint ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  create,
  edit,
  destroy,
}
