// imports
import chai from 'chai'
import User from '../models/user'

// chai tools
const expect = chai.expect
const should = chai.should()

function noTokenNoLogIn (app, done) {
  chai.request(app)
  .get('/loggedIn')
  .end((err, res) => {
    err.response.text.should.equal('Unauthorized')
    res.should.have.status(401)
    done()
  })
}

function badTokenNoLogIn (app, done) {
  chai.request(app)
  .get('/loggedIn')
  .set('Authorization', 'badToken')
  .end((err, res) => {
    err.response.text.should.equal('Unauthorized')
    res.should.have.status(401)
    done()
  })
}

function cannotCreateUserIfNoName (app, done) {
  chai.request(app)
  .post('/createUser')
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
}

function cannotCreateUserIfNoEmail (app, done) {
  chai.request(app)
  .post('/createUser')
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
}

function cannotCreateUserIfNoPassword (app, done) {
  chai.request(app)
  .post('/createUser')
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
}

function cannotCreateUserNameTaken (app, done) {
  chai.request(app)
  .post('/createUser')
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
}

function cannotCreateUserEmailTaken (app, done) {
  chai.request(app)
  .post('/createUser')
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
}

function goodTokenFromSignUp (app, token, done) {
  chai.request(app)
  .get('/loggedIn')
  .set('Authorization', token)
  .end((err, res) => {
    should.equal(err, null)
    res.should.have.status(200)
    done()
  })
}

function noSignInWithBadPassword (app, done) {
  chai.request(app)
  .post('/signIn')
  .send({ name: 'test', password: 'test1234' })
  .end((err, res) => {
    err.response.text.should.equal('Unauthorized')
    res.should.have.status(401)
    done()
  })
}

function noSignInWithBadCreds (app, done) {
  chai.request(app)
  .post('/signIn')
  .send({ name: 'tests', password: 'test123' })
  .end((err, res) => {
    err.response.text.should.equal('Unauthorized')
    res.should.have.status(401)
    done()
  })
}

function goodTokenFromSignIn (app, token, done) {
  chai.request(app)
  .get('/loggedIn')
  .set('Authorization', token)
  .end((err, res) => {
    should.equal(err, null)
    res.should.have.status(200)
    done()
  })
}

export default {
  noTokenNoLogIn,
  badTokenNoLogIn,
  cannotCreateUserIfNoName,
  cannotCreateUserIfNoEmail,
  cannotCreateUserIfNoPassword,
  cannotCreateUserNameTaken,
  cannotCreateUserEmailTaken,
  goodTokenFromSignUp,
  noSignInWithBadPassword,
  noSignInWithBadCreds,
  goodTokenFromSignIn,
}
