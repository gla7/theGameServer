// environment variables and initialization
import dotenv from 'dotenv'
dotenv.config()

// other imports
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import router from './router'

// mongo connection to DB
mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost/theGameTestDatabase')

// express instantiation and settings
const app = express()

app.use(cors())
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())
app.use(express.static(__dirname))

// routes/endpoints loaded from router file
router(app)

// server listening on port
const port = process.env.TEST_PORT || 6000

const testServer = app.listen(port, () => {
	console.log("Your test server is up at port ", port)
})

export default { app, testServer }
