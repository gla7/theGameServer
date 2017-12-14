import StageInstance from '../models/stageInstance'

function read (req, res, next) {
  // TODO: build out this function
  res.send('xD /readStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createStageInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function update (req, res, next) {
  // TODO: build out this function
  res.send('xD /updateStageInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyStageInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  read,
  create,
  update,
  destroy,
}
