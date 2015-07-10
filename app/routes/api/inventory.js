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

// List
router.get('/', function (req, res, next) {
    var urlParts = url.parse(req.url, true).query;
    var order    = urlParts.order || "name";
    var cols     = [
        "inventory.id as inventory_id",
        "name",
        "description",
        "price",
        "isMeat",
        "maxQuantityPerOrder",
        "inventory.createdAt as inventoryCreatedAt",
        "inventory.updatedAt as inventoryUpdatedAt",
        "inventory_sizes.typeName AS sizeName",
        "inventory_sizes.id AS sizeID"
    ];
    
    var qb       = Bookshelf.knex
                            .select(cols)
                            .from('inventory')
                            .innerJoin("inventory_sizes", "inventory.sizeTypeID", "inventory_sizes.id");
    
    if (cols.indexOf(order) !== -1) {
        qb.orderBy(order, "DESC");
    }

    qb.debug();

    qb.then({
         required: true,
         withRelated: ['inventory_sizes']
    })
    .then(function (inventory) {
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

module.exports = router;