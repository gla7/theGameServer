// imports
import chai from 'chai'

// chai tools
const expect = chai.expect
const should = chai.should()

function shouldNavigate (app, done) {
  chai.request(app)
  .get('/')
  .end((err, res) => {
    should.equal(err, null)
    res.should.have.status(200)
    done()
  })
}

export default {
  shouldNavigate,
}
