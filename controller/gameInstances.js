import GameInstance from '../models/gameInstance'

function read (req, res, next) {
  // TODO: build out this function
  res.send('xD /readGameInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  // TODO: build out this function
  res.send('xD /createGameInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function update (req, res, next) {
  // TODO: build out this function
  res.send('xD /updateGameInstance ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyGameInstance ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  read,
  create,
  update,
  destroy,
}
