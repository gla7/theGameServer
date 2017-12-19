import Game from '../models/game'
import helpers from './helpers'

const IMMUTABLE_PROPERTIES = ['_id', 'author', 'averageCompletionTime']

function read (req, res, next) {
  Game.findOne({ name: req.params.name }, (err, game) => {
    if (err) { return res.status(401).send(err.response) }
    if (!game) { return res.status(200).send('No games found under that name.') }
    res.send(game)
  })
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
  Game.findOne({ name: req.params.name }, (err, game) => {
    if (err) { return res.status(401).send(err.response) }
    if (!game) { return res.status(200).send('No games found under that name.') }
    if (req.user._id.toString() !== game.author.toString()) { return res.send('You do not have the permission to do this!') }
    IMMUTABLE_PROPERTIES.forEach(disallowedProp => {
    	for (let _key in req.body) {
    		delete req.body[disallowedProp]
    	}
    })
    Game.findOneAndUpdate({ _id: game._id }, req.body, { new: true }, (errUpdatedGame, updatedGame) => {
      if (err) { return res.status(500).send(err) }
      res.send(updatedGame)
    })
  })
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

function search (req, res, next) {
  return helpers.search(Game, ['name', 'description'], req, res, next)
}

export default {
  read,
  create,
  update,
  destroy,
  search,
}
