import Game from '../models/game'

function read (req, res, next) {
  // TODO: build out this function
  res.send('xD /readGame ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
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

function update (req, res, next) {
  // TODO: build out this function
  res.send('xD /updateGame ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  Game.findOne({ $and: [ { name: req.params.name }, { author: req.user } ] }, (err, game) => {
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
  read,
  create,
  update,
  destroy,
}
