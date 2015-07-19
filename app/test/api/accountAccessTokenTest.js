
/**
 * Account access token API tests
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

describe('account access token', function() {
    var account;

    it('creates an access token', function (done) {
        superagent.post(BASE_URL + "session")
                  .send({
                    name    : config.account.name,
                    password: config.account.password
                  })
                  .set('user-agent', 'young sharktank')
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
                    expect(body.session).to.have.property('userAgent');
                    
                    account         = body.account;
                    account.token   = body.session.token;
                    account.expires = body.session.expiresAt;
                    
                    done();
                  });
    });
    
    it('serves a 404 for non-existent access tokens', function (done) {
        superagent.del(BASE_URL + 'session')
                  .set('x-access-token', "lol")
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
    
    it('reads a valid access token', function (done) {
        var earl = BASE_URL + "session";
        
        superagent.get(earl)
                  .set('x-access-token', account.token)
                  .end(function(e, res) {
                    expect(e).to.eql(null);

                    expect(res.status).to.eql(200);
                    
                    var body = res.body;
                    
                    expect(body).to.be.an('object');
                    expect(body).to.not.be.empty();
                    expect(body.status).to.eql("OK");
                    expect(body.session).to.be.an('object');
                    expect(body.session.token).to.be.ok();
                    expect(body.session.expiresAt).to.be.ok();
                    expect(body.session.createdAt).to.be.ok();
                    expect(body.session.updatedAt).to.be.ok();
                    expect(body.session.originIPAddress).to.be.ok();
                    
                    expect(body.session.account).to.be.ok();
                    expect(body.session.account.id).to.be.ok();
                    expect(body.session.account).to.have.property('active');
                    expect(body.session.account.name).to.be.ok();
                    expect(body.session.account.createdAt).to.be.ok();
                    expect(body.session.account.updatedAt).to.be.ok();
                    expect(body.session.account).to.not.have.property('password');
                    
                    done();
                  });
    });
    
    it('updates an access token', function (done) {
        superagent.put(BASE_URL + 'session')
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
    
    it('fails to update an invalid access token', function (done) {
        superagent.put(BASE_URL + 'session')
                  .set('x-access-token', "werewolf")
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

    it('serves a 404 when an access token is marked inactive', function (done) {
        superagent.get(BASE_URL + 'session')
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
    
    it('deletes an access token', function (done) {
        superagent.del(BASE_URL + 'session')
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
    
    it('ensures the access token is really deleted', function (done) {
        superagent.del(BASE_URL + 'session')
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