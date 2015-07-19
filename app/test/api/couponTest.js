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
var moment      = require("moment");

describe("coupons", function() {
    var newCoupon;

    it("creates a coupon", function (done) {
        var earl = BASE_URL + "coupons";
        var percentageAmount = ~~(Math.random() * 100);
        var types = [1, 2];
        var type = types[~~(Math.random() * types.length)];

        superagent.post(earl) 
                  .send({
                    name: "(" + percentageAmount + "%) Dangerously cheesy test coupon #" + ~~(Math.random() * 999),
                    description: "So cheesy",
                    code: ~~(Math.random() * 999999),
                    expirationDate: moment().add(~~(Math.random() * 5), "days"),
                    couponTypeID: type,
                    percentageAmount: percentageAmount
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);
                      expect(res.status).to.eql(201);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.coupon).to.be.an("object");

                      newCoupon = body.coupon;

                      expect(newCoupon.guid).to.be.ok();
                      expect(newCoupon.name).to.be.ok();
                      expect(newCoupon.description).to.be.ok();
                      expect(newCoupon.code).to.be.ok();
                      expect(newCoupon.expirationDate).to.be.ok();
                      expect(newCoupon.createdAt).to.be.ok();
                      expect(newCoupon.percentageAmount).to.be.ok();

                      done();
                  });
    });
    
    it("fails to retrieve a non-existent coupon", function (done) {
        var earl = BASE_URL + "coupons/foo";

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.not.eql(null);

                      expect(res.status).to.eql(404);
                      
                      var body = res.body;

                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("ERROR");
                      
                      done();
                  });
    });

    it("retrieves a coupon", function (done) {
        var earl = BASE_URL + "coupons/" + newCoupon.guid;

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);

                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.coupon).to.be.an("object");

                      var coupon = body.coupon;

                      expect(coupon.guid).to.be.ok();
                      expect(coupon.name).to.be.ok();
                      expect(coupon.typeName).to.be.ok();
                      expect(coupon.typeCode).to.be.ok();
                      expect(coupon.code).to.be.ok();
                      expect(coupon.expirationDate).to.be.ok();
                      expect(coupon).to.have.key("description");
                      expect(coupon).to.have.key("percentageAmount");
                      expect(coupon.createdAt).to.be.ok();
                      expect(coupon.updatedAt).to.be.ok();

                      done();
                  });
    });
    
    it("updates a coupon", function (done) {
        var earl = BASE_URL + "coupons/" + newCoupon.guid;
        var newName = "Updated Coupon";

        superagent.put(earl)
                  .send({
                    name: newName
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.coupon).to.be.an("object");

                      var coupon = body.coupon;
                      
                      expect(coupon.name).to.eql(newName);
                      
                      done();
                  });
    });
    
    it("fails to update a non-existent coupon", function (done) {
        superagent.put(BASE_URL + 'coupons/1111111111')
                  .end(function(e, res) {
                      expect(e).to.not.eql(null);

                      expect(res.status).to.eql(404);
                      
                      var body = res.body;

                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("ERROR");
                      
                      done();
                  });
    });

    it("gets a list of coupons", function (done) {   
        var earl = BASE_URL + "coupons";

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);           
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.coupons).to.be.an("object");
                      
                      var coupon = body.coupons[0];

                      expect(coupon.guid).to.be.ok();
                      expect(coupon.name).to.be.ok();
                      expect(coupon.typeName).to.be.ok();
                      expect(coupon.typeCode).to.be.ok();
                      expect(coupon.code).to.be.ok();
                      expect(coupon.expirationDate).to.be.ok();
                      expect(coupon).to.have.key("description");
                      expect(coupon).to.have.key("percentageAmount");
                      expect(coupon.createdAt).to.be.ok();
                      expect(coupon.updatedAt).to.be.ok();

                      done();
                  });
    });
    
    it('deletes a coupon', function (done) {
        superagent.del(BASE_URL + 'coupons/' + newCoupon.guid)
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

    it("fails to delete a non-existent coupon", function (done) {
        superagent.del(BASE_URL + 'coupons/qux')
                  .end(function(e, res) {
                      expect(e).to.not.eql(null);

                      expect(res.status).to.eql(404);
                      
                      var body = res.body;

                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("ERROR");
                      
                      done();
                  });
    });

    it("ensures the coupon is really deleted", function (done) {
        superagent.get(BASE_URL + 'coupons/' + newCoupon.guid)
                  .end(function(e, res) {
                      expect(e).to.not.eql(null);

                      expect(res.status).to.eql(404);
                      
                      var body = res.body;

                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("ERROR");
                      
                      done();
                  });
    });
});