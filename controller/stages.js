import Stage from '../models/stage'
import Game from '../models/game'

function read (req, res, next) {
  Stage.findOne({ name: req.params.name }, (err, stage) => {
    if (err) { return res.status(401).send(err.response) }
    if (!stage) { return res.status(200).send('No stages found under that name.') }
    res.send(stage)
  })
}

function create (req, res, next) {
  Stage.findOne({ name: req.body.name }, (err, stage) => {
    if (err) { return next(err) }
    if (stage) { return res.status(422).send({ error: 'This stage name already exists!' }) }
    Game.findById(req.body.createdThroughGame, (errGame, game) => {
      if (errGame) {
        return res.send('An error occurred! Please check your payload!')
      }
      if (game) {
        const newStage = new Stage(req.body)
        newStage.author = req.user
        newStage.save((errStage, newStage) => {
          if (errStage) { return next(errStage) }
          res.send(newStage)
        })
      } else {
        req.body.createdThroughGame = null
        const newStage = new Stage(req.body)
        newStage.author = req.user
        newStage.save((errStage, newStage) => {
          if (errStage) { return next(errStage) }
          res.send(newStage)
        })
      }
    })
  })
}

function update (req, res, next) {
  // TODO: build out this function
  res.send('xD /updateStage ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  Stage.findOne({ $and: [ { name: req.params.name }, { author: req.user } ] }, (err, stage) => {
    if (err) { return next(err) }
    if (stage) {
      stage.remove((errStage) => {
        if (errStage) {
          return next(errStage)
        }
        res.send('Success')
      })
    } else {
      res.send('No matching stages were found!')
    }
  })
}

export default {
  read,
  create,
  update,
  destroy,
}
