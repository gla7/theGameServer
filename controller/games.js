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
    newGame.save((errGame, newGame) => {
      if (errGame) { return next(errGame) }
      res.send(newGame)
    })
  })
}

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editGame ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  Game.findOne({ name: req.params.name, author: req.user }, (err, game) => {
    if (err) { return next(err) }
    if (game) {
      game.remove((errGame) => {
        if (errGame) {
          return next(errGame)
        }
        res.send('Success')
      })
    } else {
      res.send('No matching games were found!')
    }
  })
}

export default {
  load,
  create,
  edit,
  destroy,
}
