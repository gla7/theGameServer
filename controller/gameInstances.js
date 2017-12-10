import GameInstance from '../models/gameInstance'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadGameInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createGameInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editGameInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyGameInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  create,
  edit,
  destroy,
}
