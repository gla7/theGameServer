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

describe('All tests:', () => {
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

  describe("Homepage tests:", () => {
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

  describe("Authentication tests:", () => {
    it("Should not mark me as logged in if I pass no token", done => {
  		chai.request(app)
  		.get("/loggedIn")
  		.end((err, res) => {
        err.response.text.should.equal('Unauthorized')
  			res.should.have.status(401)
  			done()
  		})
  	})

    it("Should not mark me as logged in if I pass a bad token", done => {
  		chai.request(app)
  		.get("/loggedIn")
      .set('Authorization', 'badToken')
  		.end((err, res) => {
        err.response.text.should.equal('Unauthorized')
  			res.should.have.status(401)
  			done()
  		})
  	})

    it("Should not be able to create user if name missing", done => {
  		chai.request(app)
  		.post("/createUser")
      .send({ email: 'test@test.com', password: 'test123' })
  		.end((err, res) => {
        User.find({ email: 'test@test.com' }, (errUser, users) => {
          err.should.not.equal(null)
          should.equal(errUser, null)
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
        User.find({ name: 'test' }, (errUser, users) => {
          err.should.not.equal(null)
          should.equal(errUser, null)
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
        User.find({ name: 'test' }, (errUser, users) => {
          err.should.not.equal(null)
          should.equal(errUser, null)
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
        User.find({ name: 'test' }, (errUser, users) => {
          if (err) { throw err }
          should.equal(errUser, null)
          users.length.should.equal(1)
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
        User.find({ name: 'test' }, (errUser, users) => {
          err.should.not.equal(null)
          should.equal(errUser, null)
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
        User.find({ name: 'test' }, (errUser, users) => {
          err.should.not.equal(null)
          should.equal(errUser, null)
          users.length.should.equal(1)
    			res.should.have.status(500)
          done()
        })
  		})
  	})

    it("Should mark me as logged in if I pass a token from sign up", done => {
  		chai.request(app)
  		.get("/loggedIn")
      .set('Authorization', token)
  		.end((err, res) => {
  			should.equal(err, null)
  			res.should.have.status(200)
  			done()
  		})
  	})

    it("Should not be able to sign in if passing wrong password", done => {
  		chai.request(app)
  		.post("/signIn")
      .send({ name: 'test', password: 'test1234' })
  		.end((err, res) => {
        err.response.text.should.equal('Unauthorized')
  			res.should.have.status(401)
  			done()
  		})
  	})

    it("Should not be able to sign in if passing wrong credentials", done => {
  		chai.request(app)
  		.post("/signIn")
      .send({ name: 'tests', password: 'test123' })
  		.end((err, res) => {
        err.response.text.should.equal('Unauthorized')
  			res.should.have.status(401)
  			done()
  		})
  	})

    it("Should be able to sign in if passing right credentials", done => {
  		chai.request(app)
  		.post("/signIn")
      .send({ name: 'test', password: 'test123' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (errUser, users) => {
          if (err) { throw err }
          should.equal(errUser, null)
          users.length.should.equal(1)
    			res.should.have.status(200)
          token = res.body.token
          done()
        })
  		})
  	})

    it("Should mark me as logged in if I pass a token from sign in", done => {
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

  describe("Game controller tests:", () => {
  	it("Should not be able to create game if not logged in", done => {
  		chai.request(app)
  		.post("/createGame")
      .send({ name: 'gameTest' })
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          games.length.should.equal(0)
          err.response.text.should.equal('Unauthorized')
    			res.should.have.status(401)
          done()
        })
  		})
  	})

    it("Should not be able to create game if sending a bad token", done => {
  		chai.request(app)
  		.post("/createGame")
      .set('Authorization', 'badToken')
      .send({ name: 'gameTest' })
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          games.length.should.equal(0)
          err.response.text.should.equal('Unauthorized')
    			res.should.have.status(401)
          done()
        })
  		})
  	})

    it("Should not be able to create game if not sending at least a name", done => {
  		chai.request(app)
  		.post("/createGame")
      .set('Authorization', token)
      .send({ badName: 'gameTest' })
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          err.should.not.equal(null)
          games.length.should.equal(0)
    			res.should.have.status(500)
          done()
        })
  		})
  	})

    it("Should be able to create game if sending at least a name whilst authenticated, and the user authenticated should be credited for it", done => {
  		chai.request(app)
  		.post("/createGame")
      .set('Authorization', token)
      .send({ name: 'gameTest' })
  		.end((err, res) => {
        User.find({ name: 'test' }, (errUser, users) => {
          Game.findById(users[0].gamesCreated[0], (errGame, game) => {
            game.author.toString().should.equal(users[0].id)
      			res.should.have.status(200)
            done()
          })
        })
  		})
  	})

    it("Should not be able to create game if sending a taken name", done => {
  		chai.request(app)
  		.post("/createGame")
      .set('Authorization', token)
      .send({ name: 'gameTest' })
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          err.should.not.equal(null)
          res.body.error.should.equal('This game name already exists!')
          games.length.should.equal(1)
    			res.should.have.status(422)
          done()
        })
  		})
  	})

    it("Should not be able to destroy game if sending a non-existent name", done => {
  		chai.request(app)
  		.get("/destroyGame/nonExistentGameName")
      .set('Authorization', token)
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          should.equal(err, null)
          games.length.should.equal(1)
    			res.should.have.status(200)
          done()
        })
  		})
  	})

    it("Should not be able to destroy game if sending a bad token", done => {
  		chai.request(app)
  		.get("/destroyGame/gameTest")
      .set('Authorization', 'badToken')
  		.end((err, res) => {
        Game.find({ name: 'gameTest' }, (errGame, games) => {
          games.length.should.equal(1)
          err.response.text.should.equal('Unauthorized')
    			res.should.have.status(401)
          done()
        })
  		})
  	})

    it("Should be able to destroy game if the right user is authenticated, and this should be reflected in the author", done => {
  		chai.request(app)
  		.get("/destroyGame/gameTest")
      .set('Authorization', token)
  		.end((err, res) => {
        User.find({ name: 'test' }, (errUser, users) => {
          Game.find({ name: 'gameTest' }, (errGame, games) => {
            users[0].gamesCreated.length.should.equal(0)
            games.length.should.equal(0)
      			res.should.have.status(200)
            res.text.should.equal('Success')
            done()
          })
        })
  		})
  	})
  })

  describe('DB tests:', () => {
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
