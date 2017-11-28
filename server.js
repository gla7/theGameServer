// imports
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import homepage from './controller/homepage'

// mongo setup
mongoose.connect('mongodb://localhost/theGame')

import Team from './models/team'

// express instantiation and settings
export const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(express.static(__dirname))

// endpoints
// gets
app.get('/', homepage) // loads homepage
//posts
app.post('/createTeam', (req, res) => {
  console.log(">>>>>>>")
  console.log("HITTING DIS AND REQ BODY IS ", req.body)
  console.log(">>>>>>>")
  const newTeam = new Team(req.body)
  newTeam.save((err, team) => {
    if (err) {
      console.log('ERROR: ', err)
    } else {
      console.log('SUCCESS: ', team)
    }
  })
})

// server listening on port
const port = 3000

app.listen(port, () => {
	console.log("Your server is up at port " + port)
})
