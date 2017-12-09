// imports
import jwt from 'jwt-simple'
import config from '../config'
import passportService from '../services/passport'
import Team from '../models/team'

function loggedIn (req, res) {
  res.send('You are logged in!!!')
}

// jwt token setup
function tokenForTeam  (team) {
  const timeStamp = new Date().getTime()
  // JWT conventions = sub: subject- who is the token about?, iat: issued at time
  return jwt.encode({ sub: team.id, iat: timeStamp }, config.secret)
}

function createTeam (req, res, next) {
  if (!req.body.name || !req.body.password) { return res.status(422).send({ error: 'You must provide team name and password!' }) }
  Team.findOne({ name: req.body.name }, (err, team) => {
    if (err) {
      return next(err)
    }
    if (team) {
      return res.status(422).send({ error: 'This team name already exists!' })
    }
    const newTeam = new Team(req.body)
    newTeam.save((err, team) => {
      if (err) { return next(err) }
      res.json({ token: tokenForTeam(team) })
    })
  })
}

function signIn (req, res, next) {
  // team has already had its team name and pw authed, need to give em a token
  res.send({ token: tokenForTeam(req.user) })
}

export default {
  loggedIn,
  createTeam,
  signIn,
}
