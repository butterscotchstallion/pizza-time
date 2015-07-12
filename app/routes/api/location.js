/**
 * inventory API routes
 *
 */
var express       = require('express');
var router        = express.Router();
var location     = require('../../models/location');
var Bookshelf     = require('../../models/index');
var url           = require('url');
var uuid          = require('node-uuid');
var fs            = require('fs');
var config        = JSON.parse(fs.readFileSync("./config/api.json", 'utf8'));
var IS_DEV        = config.env === "development";

// List
router.get('/', function (req, res, next) {
    var urlParts = url.parse(req.url, true).query;
    var order    = urlParts.order || "name";
    var Location = new location();
    
    Location.fetchAll()
		    .then({
		         required: true
		    })
		    .then(function (locations) {
		       res.status(200).json({
		            status  : "OK",
		            message : null,
		            locations : locations || []
		        });
		    })
		    .catch(function (error) {
		        res.status(200).json({
		            status: "ERROR",
		            message: error
		        });
		    });
});

// Create a location
router.post('/', function (req, res, next) {
    var model = new location();

    model.save({
            name: req.body.name,
            address: req.body.address,
            minOrderAmount: req.body.minOrderAmount,
            guid: uuid.v4(),
            zipCode: req.body.zipCode
          })
          .then(function (model) {
          	res.location(['/locations', 
                          model.get('guid')].join('/'));
            
            res.status(201).json({
                status : "OK",
                message: "Location created successfully",
                location: model
            });
          })
          .catch(function (error) {
                res.status(200).json({
                    status: "ERROR",
                    message: error
                });
          });
});

// Get location
router.get('/:guid', function (req, res, next) {
    var Location = new location({
        guid: req.params.guid
    });

    Location.fetch()
            .then(function (location) {
                if (location) {
                    res.status(200).json({
                        status  : "OK",
                        message : null,
                        location: location
                    });
                } else {
                    res.status(404).json({
                        status: "ERROR",
                        message: "Item not found."
                    });
                }
            })
            .catch(function (error) {
                res.status(200).json({
                    status: "ERROR",
                    message: error
                });
            });
});

// Update location
router.put('/:guid', function (req, res, next) {
    var item   = req.body;
    var model  = new location({
        guid: req.params.guid
    });
    var options = { patch: true };

    model.fetch()
         .then(function (result) {
            if (result) {
                model.save(item, options)
                    .then(function (model) {                        
                        res.location(['/locations/', model.get('guid')].join('/'));
                        
                        res.status(200).json({
                            status : "OK",
                            message: "Location updated.",
                            location: model
                        });
                    })
                    .catch(function (error) {
                        res.status(200).json({
                            status: "ERROR",
                            message: error
                        });
                    });
            } else {
                res.status(404).json({
                    status: "ERROR",
                    message: "Location not found."
                });
            }
        });
});

// delete location
router.delete('/:guid', function (req, res, next) {
    var guid = req.params.guid;
    var model = new location({
        guid: guid
    });
    
    model.fetch()
        .then(function (result) {
            if (result) {    
                model.destroy()
                   .then(function () {
                        res.status(200).json({
                            status       : "OK",
                            message      : "Location deleted."
                        });
                    })
                    .catch(function (error) {
                        res.status(200).json({
                            status: "ERROR",
                            message: IS_DEV ? error : "Error deleting location."
                        });
                    });
            } else {
                res.status(404).json({
                    status: "ERROR",
                    message: "Location not found."
                });
            }
        })
        .catch(function (error) {
            res.status(200).json({
                status: "ERROR",
                message: IS_DEV ? error : "Error deleting location."
            });
        });
});

module.exports = router;
