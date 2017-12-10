import Stage from '../models/stage'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadStage ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createStage ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editStage ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyStage ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  create,
  edit,
  destroy,
}
