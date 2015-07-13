/**
 * inventory API routes
 *
 */
var express       = require('express');
var router        = express.Router();
var inventory     = require('../../models/inventory');
var Bookshelf     = require('../../models/index');
var url           = require('url');
var _             = require('underscore');
var uuid          = require('node-uuid');
var fs            = require('fs');
var config        = JSON.parse(fs.readFileSync("./config/api.json", 'utf8'));
var IS_DEV        = config.env === "development";

// List
router.get('/', function (req, res, next) {
    var urlParts = url.parse(req.url, true).query;
    var order    = urlParts.order || "name";
    var cols     = [
        "inventory.id as inventoryID",
        "name",
        "description",
        "price",
        "isMeat",
        "maxQuantityPerOrder",
        "inventory.guid",
        "inventory.createdAt",
        "inventory.updatedAt",
        "inventory_sizes.typeName AS sizeName",
        "inventory_sizes.id AS sizeID",
        "inventory_types.typeName",
        "inventory_types.typeCode",
        "inventory_types.id AS typeID"
    ];

    var qb = Bookshelf.knex
                        .select(cols)
                        .from('inventory')
                        .innerJoin("inventory_sizes", "inventory.sizeTypeID", "inventory_sizes.id")
                        .innerJoin("inventory_types", "inventory.inventoryTypeID", "inventory_types.id");
    
    if (cols.indexOf(order) !== -1) {
        qb.orderBy(order, "DESC");
    }

    qb.then(function (inventory) { 
        res.status(200).json({
            status  : "OK",
            message : null,
            inventory : inventory || []
        });
    })
    .catch(function (error) {
        res.status(200).json({
            status: "ERROR",
            message: error
        });
    });
});

// Create an inventory item
router.post('/', function (req, res, next) {
    var name = req.body.name;
    var description = req.body.description;    
    var price = req.body.price;    
    var isMeat = req.body.isMeat;
    var maxQuantityPerOrder = req.body.maxQuantityPerOrder;
    var sizeTypeID = req.body.sizeTypeID;
    var inventoryTypeID = req.body.inventoryTypeID;
    var serviceMethods = req.body.serviceMethods;
    var model = new inventory();

    model.save({
            name: name,
            description: description,
            price: price,
            isMeat: isMeat,
            maxQuantityPerOrder: maxQuantityPerOrder,
            sizeTypeID: sizeTypeID,
            inventoryTypeID: inventoryTypeID,
            guid: uuid.v4()
          })
          .then(function (model) {
            res.location(['/inventory', 
                          model.get('guid')].join('/'));
            
            res.status(201).json({
                status : "OK",
                message: "Inventory item created successfully",
                item   : model
            });
          })
          .catch(function (error) {
                res.status(400).json({
                    status: "ERROR",
                    message: IS_DEV ? error : "Error creating inventory item."
                });
          });
});

// get item
router.get('/:guid', function (req, res, next) {
    var Inventory = new inventory({
        guid: req.params.guid
    });

    Inventory.fetch()
            .then(function (item) {
                if (item) {
                    res.status(200).json({
                        status  : "OK",
                        message : null,
                        item: item
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

// Update item
router.put('/:guid', function (req, res, next) {
    var item   = req.body;
    var model  = new inventory({
        guid: req.params.guid
    });
    var options = { patch: true };

    model.fetch()
         .then(function (result) {
            if (result) {
                model.save(item, options)
                    .then(function (model) {                        
                        res.location(['/inventory/', model.get('guid')].join('/'));
                        
                        res.status(200).json({
                            status : "OK",
                            message: "Inventory item updated.",
                            item: model
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
                    message: "Inventory item not found."
                });
            }
        });
});

// delete item
router.delete('/:guid', function (req, res, next) {
    var guid = req.params.guid;
    var model = new inventory({
        guid: guid
    });
    
    model.fetch()
        .then(function (result) {
            if (result) {    
                model.destroy()
                   .then(function () {
                        res.status(200).json({
                            status       : "OK",
                            message      : "Inventory item deleted."
                        });
                    })
                    .catch(function (error) {
                        res.status(200).json({
                            status: "ERROR",
                            message: IS_DEV ? error : "Error deleting inventory item."
                        });
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
                message: IS_DEV ? error : "Error deleting inventory item."
            });
        });
});

module.exports = router;