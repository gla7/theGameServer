import Hint from '../models/hint'
import Stage from '../models/stage'

function load (req, res, next) {
  // TODO: build out this function
  res.send('xD /loadHint ' + req.user + ', ' + JSON.stringify(req.params, null, 4))
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

function edit (req, res, next) {
  // TODO: build out this function
  res.send('xD /editHint ' + req.user + ', ' + JSON.stringify(req.body, null, 4))
}

function destroy (req, res, next) {
  Hint.findOne({ _id: req.params.id }, (err, hint) => {
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
  })
}

export default {
  load,
  create,
  edit,
  destroy,
}
