// imports
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import jwt from 'jwt-simple'
import config from './config'
import passport from 'passport'
import passportService from './services/passport'
import homepage from './controller/homepage'

// passport setup for token sessions (false to cookie sessions)
const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignIn = passport.authenticate('local', { session: false })

// mongo setup
mongoose.connect('mongodb://localhost/theGame')

import Team from './models/team'

// express instantiation and settings
export const app = express()

app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(express.static(__dirname))

// jwt token setup
function tokenForTeam (team) {
  const timeStamp = new Date().getTime()
  // JWT conventions = sub: subject- who is the token about?, iat: issued at time
  return jwt.encode({ sub: team.id, iat: timeStamp }, config.secret)
}

// endpoints
// gets
app.get('/', homepage) // loads homepage
app.get('/loggedIn', requireAuth, (req, res) => {
  res.send('You are logged in!!!')
})
//posts
app.post('/createTeam', (req, res, next) => {
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
})
app.post('/signIn', requireSignIn, (req, res, next) => {
  // team has already had its team name and pw authed, need to give em a token
  res.send({ token: tokenForTeam(req.user) })
})

// server listening on port
const port = 3000

app.listen(port, () => {
	console.log("Your server is up at port " + port)
})
