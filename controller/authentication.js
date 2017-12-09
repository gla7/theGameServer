// imports
import jwt from 'jwt-simple'
import config from '../config'
import passportService from '../services/passport'
import User from '../models/user'

function loggedIn (req, res) {
  res.send('You are logged in!!!')
}

// jwt token setup
function tokenForUser  (user) {
  const timeStamp = new Date().getTime()
  // JWT conventions = sub: subject- who is the token about?, iat: issued at time
  return jwt.encode({ sub: user.id, iat: timeStamp }, config.secret)
}

function createUser (req, res, next) {
  if (!req.body.name || !req.body.password) { return res.status(422).send({ error: 'You must provide user name and password!' }) }
  User.findOne({ name: req.body.name }, (err, user) => {
    if (err) {
      return next(err)
    }
    if (user) {
      return res.status(422).send({ error: 'This user name already exists!' })
    }
    const newUser = new User(req.body)
    newUser.save((err, user) => {
      if (err) { return next(err) }
      res.json({ token: tokenForUser(user) })
    })
  })
}

function signIn (req, res, next) {
  // user has already had its user name and pw authed, need to give em a token
  res.send({ token: tokenForUser(req.user) })
}

export default {
  loggedIn,
  createUser,
  signIn,
}
