// imports
import mongoose from 'mongoose'
import chai from 'chai'
import chaiHttp from 'chai-http'
import Game from '../models/game'
import User from '../models/user'
import Stage from '../models/stage'
import server from '../testServer'

const expect = chai.expect
const should = chai.should()
const app = server.app
chai.use(chaiHttp)

let token

describe('All tests will now run', () => {
  //Before starting the test, create a sandboxed database connection
  //Once a connection is established invoke done()
  before(done => {
    mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost/theGameTestDatabase')
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error'))
    db.once('open', () => {
      console.log('We are connected to test database!')
      done()
    })
  })

  describe("Homepage load", () => {
  	it("Should be able to navigate to the homepage", done => {
  		chai.request(app)
  		.get("/")
  		.end((err, res) => {
  			should.equal(err, null)
  			res.should.have.status(200)
  			done()
  		})
  	})
  })

  describe("Create user", () => {
    it("Should not be able to create user if name missing", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ email: 'test@test.com', password: 'test123' })
  		.end((err, res) => {
        User.find({ email: 'test@test.com' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
          users.length.should.equal(0)
    			res.should.have.status(422)
          done()
        })
  		})
  	})

    it("Should not be able to create user if email missing", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ name: 'test', password: 'test123' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
          users.length.should.equal(0)
    			res.should.have.status(422)
          done()
        })
  		})
  	})

    it("Should not be able to create user if password missing", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ name: 'test', email: 'test@test.com' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
          users.length.should.equal(0)
    			res.should.have.status(422)
          done()
        })
  		})
  	})

    it("Should be able to create user if all of the aforementioned are present", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ name: 'test', email: 'test@test.com', password: 'test123' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
    			res.should.have.status(200)
          token = res.body.token
          done()
        })
  		})
  	})

    it("Should not be able to create user if name exists", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ name: 'test', email: 't@test.com', password: 'test123' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
          users.length.should.equal(1)
    			res.should.have.status(422)
          done()
        })
  		})
  	})

    it("Should not be able to create user if email exists", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ name: 'tests', email: 'test@test.com', password: 'test123' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (err, users) => {
          if (err) { throw err }
          should.equal(err, null)
          users.length.should.equal(1)
    			res.should.have.status(500)
          done()
        })
  		})
  	})
  })

  describe("Logged In", () => {
  	it("Should mark me as logged in if I pass a token", done => {
  		chai.request(app)
  		.get("/loggedIn")
      .set('Authorization', token)
  		.end((err, res) => {
  			should.equal(err, null)
  			res.should.have.status(200)
  			done()
  		})
  	})
  })

  describe('Test Database', () => {
    //Save object with 'name' value of 'Mike"
    it('New name saved to test database', done => {
      var testName = new Game({
        name: 'Mike'
      })

      testName.save(done)
    })

    it('Dont save incorrect format to database', done => {
      //Attempt to save with wrong info. An error should trigger
      var wrongSave = new Game({
        notName: 'Not Mike'
      })
      wrongSave.save(err => {
        if (err) { return done() }
        throw new Error('Should generate error!')
      })
    })

    it('Should retrieve data from test database', done => {
      //Look up the 'Mike' object previously saved.
      Game.find({ name: 'Mike' }, (err, name) => {
        if (err) { throw err }
        if (name.length === 0) { throw new Error('No data!') }
        done()
      })
    })
  })

  //After all tests are finished drop database and close connection
  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      server.testServer.close(() => {
        console.log('Server closed!')
        mongoose.connection.close(done)
        console.log('Mongoose connection closed!')
        setTimeout(() => { process.exit(0) }, 2000)
      })
    })
  })
})
