var auth = require('./credential.json')
var fixture = require('./fixture.json')
var assert = require('assert')
var Mailgun = require('./../lib/mailgun-isomorphic.js')

require('es6-promise').polyfill();

var mailgun = new Mailgun()

mailgun.setApiKey(auth.apiKey)

describe("Test connection", function() {

  it("should return true", function(done){
    mailgun.testConnection(function(success) {
      assert.equal(true, success);
      done()
    })
  });

});

describe("Test get domains", function() {

  it("should pass", function() {
    return mailgun.domains().list().then(items => {
      assert.equal('object', typeof items);
    })
  });

});

describe("Test sending messages", function() {

  it("should be missing a parameter", function() {
    return mailgun.messages().send(fixture.messages.missing_parameter_from)
      .then(mailing => {})
      .catch(e => {
        assert.ok(e);
        assert(/You need to give a value for 'from' parameter/.test(e.message));
      })
  });

});