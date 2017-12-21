import Stage from '../models/stage'
import Game from '../models/game'
import helpers from './helpers'

const IMMUTABLE_PROPERTIES = ['_id', 'author']

function read (req, res, next) {
  Stage.findOne({ name: req.params.name }, (err, stage) => {
    if (err) { return res.status(401).send(err.response) }
    if (!stage) { return res.status(200).send('No stages found under that name.') }
    res.send(stage)
  })
}

// TODO: need to pass all reads to being by id, screwed up on that one!
function readById (req, res, next) {
  Stage.findOne({ _id: req.params.id }, (err, stage) => {
    if (err) { return res.status(401).send(err.response) }
    if (!stage) { return res.status(200).send('No stages found under that id.') }
    const stageCopy = JSON.parse(JSON.stringify(stage))
    delete stageCopy['answer']
    res.send(stageCopy)
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
  Stage.findOne({ name: req.params.name }, (err, stage) => {
    if (err) { return res.status(401).send(err.response) }
    if (!stage) { return res.status(200).send('No stages found under that name.') }
    if (req.user._id.toString() !== stage.author.toString()) { return res.send('You do not have the permission to do this!') }
    IMMUTABLE_PROPERTIES.forEach(disallowedProp => {
    	for (let _key in req.body) {
    		delete req.body[disallowedProp]
    	}
    })
    Stage.findOneAndUpdate({ _id: stage._id }, req.body, { new: true }, (errUpdatedStage, updatedStage) => {
      if (err) { return res.status(500).send(err) }
      res.send(updatedStage)
    })
  })
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

function search (req, res, next) {
  return helpers.search(Stage, ['name', 'content'], req, res, next)
}

export default {
  read,
  readById,
  create,
  update,
  destroy,
  search,
}
