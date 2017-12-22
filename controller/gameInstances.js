import GameInstance from '../models/gameInstance'
import Game from '../models/game'

function read (req, res, next) {
  GameInstance.findOne({ _id: req.params.id }, (err, gameInstance) => {
    if (err) { return res.status(401).send(err.response) }
    if (!gameInstance) { return res.status(200).send('No game instances found under that id.') }
    res.send(gameInstance)
  })
}

function create (req, res, next) {
  if (!req.body.game) { return res.send('Cannot initiate a game without a game.') }
  Game.findOne({ _id: req.body.game }, (errGame, game) => {
    if (errGame) { return next(errGame) }
    if (!game) { return res.status(422).send({ error: 'The game id you provided does not exist.' }) }
    const newGameInstance = new GameInstance({
      game,
      conductor: req.user,
      team: !req.body.team ? [] : req.body.team,
      stages: game.stages,
    })
    newGameInstance.save((errGameInstance, savedGameInstance) => {
      if (errGameInstance) { return next(errGameInstance) }
      res.send(savedGameInstance)
    })
  })
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
