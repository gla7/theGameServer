import Stage from '../models/stage'
import Game from '../models/game'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadStage ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
}

function create (req, res, next) {
  Stage.findOne({ name: req.body.name }, (err, stage) => {
    if (err) { return next(err) }
    if (stage) { return res.status(422).send({ error: 'This stage name already exists!' }) }
    Game.findById(req.body.createdThroughGame, (err, game) => {
      if (err) {
        return res.send('An error occurred! Please check your payload!')
      }
      if (game) {
        const newStage = new Stage(req.body)
        newStage.author = req.user
        newStage.save((err, newStage) => {
          if (err) { return next(err) }
          res.send(newStage)
        })
      } else {
        req.body.createdThroughGame = null
        const newStage = new Stage(req.body)
        newStage.author = req.user
        newStage.save((err, newStage) => {
          if (err) { return next(err) }
          res.send(newStage)
        })
      }
    })
  })
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
