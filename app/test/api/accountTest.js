
/**
 * Coupon API tests
 *
 */
"use strict";

var superagent = require("superagent");
var expect      = require("expect.js");
var fs          = require("fs");
var config      = JSON.parse(fs.readFileSync("./config/api.json", "utf8"));
var BASE_URL    = config.baseURL;
var qs          = require("querystring");
var _           = require("underscore");

if (!config) {
  throw new Error("Error reading config.");
}

describe('accounts', function() {
    var account = {};

    it('logs in and gets an access token', function (done) {
        superagent.post(BASE_URL + "session")
                  .send({
                    name    : config.account.name,
                    password: config.account.password
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(201);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    
                    expect(body.account).to.be.an('object');
                    expect(body.account.password).to.eql(null);
                    
                    expect(body.session.expiresAt).to.be.ok();
                    expect(body.session.token).to.be.ok();
                    expect(body.session.originIPAddress).to.be.ok();
                    
                    account.token   = body.session.token;
                    
                    done();
                  });    
    });
    
    it('fails to creates an account with bogus info', function (done) {
        var earl = BASE_URL + "accounts";
        
        superagent.post(earl)
                  .set('x-access-token', account.token)
                  .send({
                    "hello": "world"
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });

    it('creates an account', function (done) {
        var earl = BASE_URL + "accounts";
        
        superagent.post(earl)
                  .set('x-access-token', account.token)
                  .send({
                    name   : ~~(Math.random() * 31337),
                    email  : config.email.username,
                    testing: true
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(201);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    expect(body.account).to.be.an('object');
                    expect(body.account.guid).to.be.ok();
                    expect(body.account.activationCode).to.be.ok();
                    expect(body.account.emailAddress).to.be.ok();

                    account = _.extend(account, body.account);
                    
                    done();
                  });
    });
    
    it('activates an account', function (done) {
        var earl = BASE_URL + "accounts/activate";
        
        superagent.put(earl)
                  .send({
                    activationCode: account.activationCode,
                    password: "test"
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    
                    done();
                  });
    });

    it('fails to activate using an invalid activation code', function (done) {
        var earl = BASE_URL + "accounts/activate";
        
        superagent.put(earl)
                  .send({
                    activationCode: "invalid activation code",
                    password: "test"
                  })
                  .end(function(e, res) {
                    expect(e).to.not.eql(null);
                    expect(res.status).to.eql(400);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });

    it('fails to fetch a non-existent account', function (done) {
        var earl = BASE_URL + "accounts/lol";
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.not.eql(null);

                    expect(res.status).to.eql(404);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });
    
    it('fetches an account', function (done) {
        var earl = BASE_URL + "accounts/" + account.guid;
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    expect(body.account).to.be.an('object');
                    expect(body.account.password).to.eql(null);
                    
                    done();
                  });
    });
    
    it('fetches a list of accounts', function (done) {
        var earl = BASE_URL + "accounts";
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    expect(body.accounts).to.be.an('object');
                    
                    done();
                  });
    });
    
    it('fetches a list of accounts searching by account name', function (done) {
        var earl = BASE_URL + "accounts?name=" + account.name;
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    expect(body.accounts).to.be.an('object');
                    expect(body.accounts.length).to.eql(1);
                    
                    done();
                  });
    });
    
    it('fails to login with a non-existent account', function (done) {
        var earl = BASE_URL + "session";
        
        superagent.post(earl)
                  .set('x-access-token', account.token)
                  .send({
                    name    : "lol",
                    password: "lol"
                  })
                  .end(function(e, res) {
                    expect(e).to.eql(null);
                    
                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });
    
    it('fails to update a non-existent account', function (done) {
        superagent.put(BASE_URL + 'accounts/lol')
                  .set('x-access-token', account.token)
                  .send({
                    active: 0
                  })
                  .end(function(e, res) {
                      expect(e).to.not.eql(null);           
                      expect(res.status).to.eql(404);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an('object');
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("ERROR");
                      
                      done();
                  });
    });
    
    it('updates a specific account', function (done) {
        superagent.put(BASE_URL + 'accounts/' + account.guid)
                  .set('x-access-token', account.token)
                  .send({
                    active: 0
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);   
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;

                      expect(body).to.be.an('object');
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      
                      done();
                  });
    });
    
    it('fails to fetch an inactive account', function (done) {
        var earl = BASE_URL + "accounts/" + account.guid;
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.not.eql(null);
                    
                    expect(res.status).to.eql(404);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });
    
    it('deletes an account', function (done) {
        superagent.del(BASE_URL + 'accounts/' + account.guid)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                      expect(e).to.eql(null);           
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an('object');
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      
                      done();
                  });
    });
    
    it('fails to fetch a non-existent account', function (done) {
        var earl = BASE_URL + "accounts/" + account.guid;
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.not.eql(null);
                    
                    expect(res.status).to.eql(404);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("ERROR");
                    
                    done();
                  });
    });
});