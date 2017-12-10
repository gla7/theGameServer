import StageInstance from '../models/stageInstance'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createStageInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editStageInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  create,
  edit,
  destroy,
}
