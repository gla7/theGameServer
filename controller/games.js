import Game from '../models/game'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadGame ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  Game.findOne({ name: req.body.name }, (err, game) => {
    if (err) { return next(err) }
    if (game) { return res.status(422).send({ error: 'This game name already exists!' }) }
    const newGame = new Game(req.body)
    newGame.author = req.user
    newGame.save((err, game) => {
      if (err) { return next(err) }
      res.send('created a game! here is the user: ' + req.user + ' and game: ' + game)
    })
  })
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editGame ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  // TODO: build out this function
  res.send('xD /destroyGame ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

export default {
  load,
  create,
  edit,
  destroy,
}
