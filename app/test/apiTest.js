/**
 * API tests
 *
 */
"use strict";

var superagent = require('superagent');
var expect      = require('expect.js');
var fs          = require('fs');
var config      = JSON.parse(fs.readFileSync("../config/api.json", 'utf8'));
var BASE_URL    = config.base_url;
var qs          = require('querystring');
var _           = require('underscore');

describe('inventory', function() {
    it('gets a list of inventory items', function (done) {   
        var earl = BASE_URL + "inventory"

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);           
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an('object');
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.inventory).to.be.an('object');

                      done();
                  });
    });

    /*
     it('fetches an inventory item', function (done) {
        var earl = BASE_URL + "inventory/" + 1
        
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
	*/
});