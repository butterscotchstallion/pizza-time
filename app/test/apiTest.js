/**
 * API tests
 *
 */
"use strict";

var superagent = require("superagent");
var expect      = require("expect.js");
var fs          = require("fs");
var config      = JSON.parse(fs.readFileSync("./config/api.json", "utf8"));
var BASE_URL    = config.base_url;
var qs          = require("querystring");
var _           = require("underscore");

describe("inventory", function() {
    var newItem;

    it("creates an inventory item", function (done) {
        var earl = BASE_URL + "inventory"

        superagent.post(earl)
                  .send({
                    name: "Dangerously Cheesy Test Nachos",
                    description: "Test nachos",
                    price: 5.00,
                    isMeat: false,
                    maxQuantityPerOrder: 5,
                    sizeTypeID: 2,
                    inventoryTypeID: 2
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);

                      expect(res.status).to.eql(201);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.item).to.be.an("object");

                      newItem = body.item;
                      
                      expect(newItem.guid).to.be.ok();
                      expect(newItem.name).to.be.ok();
                      expect(newItem).to.have.key("description");
                      expect(newItem).to.have.key("price");
                      expect(newItem).to.have.key("isMeat");
                      expect(newItem).to.have.key("maxQuantityPerOrder");
                      expect(newItem).to.have.key("updatedAt");
                      expect(newItem.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it("fails to retrieve a non-existent item", function (done) {
        var earl = BASE_URL + "inventory/foo";

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

    it("retrieves an item", function (done) {
        var earl = BASE_URL + "inventory/" + newItem.guid

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);

                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.item).to.be.an("object");

                      var item = body.item;
                      
                      expect(item.guid).to.be.ok();
                      expect(item.name).to.be.ok();
                      expect(item).to.have.key("description");
                      expect(item).to.have.key("price");
                      expect(item).to.have.key("isMeat");
                      expect(item).to.have.key("maxQuantityPerOrder");
                      expect(item).to.have.key("updatedAt");
                      expect(item.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it("updates an item", function (done) {
        var earl = BASE_URL + "inventory/" + newItem.guid
        var newDescription = "Soooo updated";
        var newPrice = .99;

        superagent.put(earl)
                  .send({
                    description: newDescription,
                    price: newPrice
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.item).to.be.an("object");

                      var item = body.item;
                      
                      expect(item.guid).to.be.ok();
                      expect(item.name).to.be.ok();
                      expect(item).to.have.key("description");
                      expect(item.description).to.eql(newDescription);
                      expect(item).to.have.key("price");
                      expect(item.price).to.eql(newPrice);
                      expect(item).to.have.key("isMeat");
                      expect(item).to.have.key("maxQuantityPerOrder");
                      expect(item.createdAt).to.be.ok();
                      expect(item.updatedAt).to.be.ok();

                      done();
                  });
    });
    
    it("fails to update a non-existent item", function (done) {
        superagent.put(BASE_URL + 'inventory/1111111111')
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

    it('deletes an item', function (done) {
        superagent.del(BASE_URL + 'inventory/' + newItem.guid)
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

    it("fails to delete a non-existent item", function (done) {
        superagent.del(BASE_URL + 'inventory/1111111111')
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

    it("ensures the item is really deleted", function (done) {
        superagent.get(BASE_URL + 'inventory/' + newItem.guid)
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

    it("gets a list of inventory items", function (done) {   
        var earl = BASE_URL + "inventory"

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);           
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.inventory).to.be.an("object");

                      var inventoryItem = body.inventory[0];

                      expect(inventoryItem).to.have.key("guid");
                      expect(inventoryItem.name).to.be.ok();
                      expect(inventoryItem).to.have.key("description");
                      expect(inventoryItem).to.have.key("price");
                      expect(inventoryItem).to.have.key("isMeat");
                      expect(inventoryItem).to.have.key("maxQuantityPerOrder");
                      expect(inventoryItem).to.have.key("updatedAt");
                      expect(inventoryItem.createdAt).to.be.ok();
                      expect(inventoryItem.typeName).to.be.ok();
                      expect(inventoryItem.typeID).to.be.ok();

                      done();
                  });
    });
});

describe("locations", function() {
    var newLocation;

    it("creates a location", function (done) {
        var earl = BASE_URL + "locations"

        superagent.post(earl)
                  .send({
                    name: "Dangerously cheesy test location",
                    address: "13 Test Street",
                    zipCode: "90210",
                    minOrderAmount: 10.00
                  })
                  .end(function(e, res) {
                      expect(e).to.eql(null);

                      expect(res.status).to.eql(201);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.location).to.be.an("object");

                      newLocation = body.location;
                      
                      expect(newLocation.guid).to.be.ok();
                      expect(newLocation.name).to.be.ok();
                      expect(newLocation).to.have.key("name");
                      expect(newLocation).to.have.key("address");
                      expect(newLocation).to.have.key("zipCode");
                      expect(newLocation).to.have.key("minOrderAmount");
                      expect(newLocation).to.have.key("updatedAt");
                      expect(newLocation.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it("fails to retrieve a non-existent location", function (done) {
        var earl = BASE_URL + "locations/foo";

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

    it("retrieves a location", function (done) {
        var earl = BASE_URL + "locations/" + newLocation.guid

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);

                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.location).to.be.an("object");

                      var location = body.location;
                      
                      expect(location.guid).to.be.ok();
                      expect(location.name).to.be.ok();
                      expect(location).to.have.key("name");
                      expect(location).to.have.key("address");
                      expect(location).to.have.key("zipCode");
                      expect(location).to.have.key("minOrderAmount");
                      expect(location).to.have.key("updatedAt");
                      expect(location.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it("updates a location", function (done) {
        var earl = BASE_URL + "locations/" + newLocation.guid;
        var newName = "Updated Location";

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
                      expect(body.location).to.be.an("object");

                      var location = body.location;
                      
                      expect(location.guid).to.be.ok();
                      expect(location).to.have.key("name");
                      expect(location.name).to.eql(newName);
                      expect(location).to.have.key("address");
                      expect(location).to.have.key("zipCode");
                      expect(location).to.have.key("minOrderAmount");
                      expect(location).to.have.key("updatedAt");
                      expect(location.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it("fails to update a non-existent location", function (done) {
        superagent.put(BASE_URL + 'locations/1111111111')
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

    it("gets a list of locations", function (done) {   
        var earl = BASE_URL + "locations";

        superagent.get(earl)
                  .end(function(e, res) {
                      expect(e).to.eql(null);           
                      expect(res.status).to.eql(200);
                      
                      var body = res.body;
                      
                      expect(body).to.be.an("object");
                      expect(body).to.not.be.empty();
                      expect(body.status).to.eql("OK");
                      expect(body.locations).to.be.an("object");
                      
                      var location = body.locations[0];

                      expect(location.guid).to.be.ok();
                      expect(location).to.have.key("name");
                      expect(location).to.have.key("address");
                      expect(location).to.have.key("zipCode");
                      expect(location).to.have.key("minOrderAmount");
                      expect(location).to.have.key("updatedAt");
                      expect(location.createdAt).to.be.ok();

                      done();
                  });
    });
    
    it('deletes a location', function (done) {
        superagent.del(BASE_URL + 'locations/' + newLocation.guid)
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

    it("fails to delete a non-existent location", function (done) {
        superagent.del(BASE_URL + 'locations/1111111111')
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

    it("ensures the location is really deleted", function (done) {
        superagent.get(BASE_URL + 'locations/' + newLocation.guid)
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