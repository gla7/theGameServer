import Hint from '../models/hint'
import Stage from '../models/stage'

const IMMUTABLE_PROPERTIES = ['_id', 'stage']

function read (req, res, next) {
  Hint.findOne({ _id: req.params.id }, (err, hint) => {
    if (err) { return res.status(401).send(err.response) }
    if (!hint) { return res.status(200).send('No hints found under that name.') }
    res.send(hint)
  })
}

function create (req, res, next) {
  Stage.findById(req.body.stage, (errStage, stage) => {
    if (errStage) {
      return res.send('An error occurred! Please check your payload!')
    }
    if (stage) {
      const newHint = new Hint(req.body)
      newHint.save((errHint, newHint) => {
        if (errHint) { return next(errHint) }
        res.send(newHint)
      })
    } else {
      return res.send('An error occurred! Please check your payload!')
    }
  })
}

function update (req, res, next) {
  if (!req.params.id) {
    return res.send('Cannot update without the id!')
  }
  const hintId = req.params.id
  IMMUTABLE_PROPERTIES.forEach(disallowedProp => {
  	for (let _key in req.body) {
  		delete req.body[disallowedProp]
  	}
  })
  Stage.find({ $and: [ { author: req.user }, { hints: hintId } ] }, (errStage, stages) => {
    if (errStage) { return next(errStage) }
    if (stages.length >= 1) {
      Hint.findOneAndUpdate({ "_id": hintId }, req.body, { new: true }, (err, hint) => {
        if (err) { return res.status(500).send(err) }
        res.send(hint)
      })
    } else {
      res.send('You do not have the permission to do this!')
    }
  })
}

function destroy (req, res, next) {
  Hint.findOne({ _id: req.params.id }, (err, hint) => {
    if (err) { return next(err) }
    Stage.find({ $and: [ { author: req.user }, { hints: hint } ] }, (errStage, stages) => {
      if (errStage) { return next(errStage) }
      if (stages.length >= 1) {
        if (err) { return next(err) }
        if (hint) {
          hint.remove((errHint) => {
            if (errHint) {
              return next(errHint)
            }
            res.send('Success')
          })
        } else {
          res.send('No matching hints were found!')
        }
      } else {
        res.send('You do not have the permission to do this!')
      }
    })
  })
}

export default {
  read,
  create,
  update,
  destroy,
}
