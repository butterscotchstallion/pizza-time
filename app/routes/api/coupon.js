/**
 * Coupon API routes
 *
 */
var express       = require('express');
var router        = express.Router();
var coupon        = require('../../models/coupon');
var couponType     = require('../../models/couponType');
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
    
    var cols = [
        "coupons.guid",
        "coupons.name",
        "coupons.description",
        "coupons.expirationDate",
        "coupons.code",
        "coupons.percentageAmount",
        "coupons.createdAt",
        "coupons.updatedAt",
        "coupon_types.typeName",
        "coupon_types.typeCode"
    ];

    var qb = Bookshelf.knex
        .select(cols)
        .from('coupons')
        .innerJoin("coupon_types", "coupons.couponTypeID", "coupon_types.id");
    
	qb.then(function (coupons) {
       res.status(200).json({
            status  : "OK",
            message : null,
            coupons : coupons || []
        });
    })
    .catch(function (error) {
        res.status(200).json({
            status: "ERROR",
            message: error
        });
    });
});

// Create a coupon
router.post('/', function (req, res, next) {
    var model = new coupon();

    model.save({
            name: req.body.name,
            code: req.body.code,
            expirationDate: req.body.expirationDate,
            description: req.body.description,
            guid: uuid.v4(),
            couponTypeID: req.body.couponTypeID,
            percentageAmount: req.body.percentageAmount
          })
          .then(function (model) {
          	res.location(['/coupons', 
                          model.get('guid')].join('/'));
            
            res.status(201).json({
                status : "OK",
                message: "Coupon created successfully",
                coupon: model
            });
          })
          .catch(function (error) {
                console.log(error);

                res.status(200).json({
                    status: "ERROR",
                    message: error
                });
          });
});

// Get coupon
router.get('/:guid', function (req, res, next) {
    var cols = [
        "coupons.guid",
        "coupons.name",
        "coupons.description",
        "coupons.expirationDate",
        "coupons.code",
        "coupons.percentageAmount",
        "coupons.createdAt",
        "coupons.updatedAt",
        "coupon_types.typeName",
        "coupon_types.typeCode"
    ];

    var qb = Bookshelf.knex
        .select(cols)
        .from('coupons')
        .innerJoin("coupon_types", "coupons.couponTypeID", "coupon_types.id");
    
    qb.where({ 
        guid: req.params.guid 
    });

    qb.then(function (coupon) {
        if (coupon.length > 0) {
            res.status(200).json({
                status  : "OK",
                message : null,
                coupon: coupon[0]
            });
        } else {
            res.status(404).json({
                status: "ERROR",
                message: "Coupon not found."
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

// Update coupon
router.put('/:guid', function (req, res, next) {
    var item   = req.body;
    var model  = new coupon({
        guid: req.params.guid
    });
    var options = { patch: true };

    model.fetch()
         .then(function (result) {
            if (result) {
                model.save(item, options)
                    .then(function (model) {                        
                        res.location(['/coupons/', model.get('guid')].join('/'));
                        
                        res.status(200).json({
                            status : "OK",
                            message: "Coupon updated.",
                            coupon: model
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
                    message: "Coupon not found."
                });
            }
        });
});

// delete coupon
router.delete('/:guid', function (req, res, next) {
    var guid = req.params.guid;
    var model = new coupon({
        guid: guid
    });
    
    model.fetch()
        .then(function (result) {
            if (result) {    
                model.destroy()
                   .then(function () {
                        res.status(200).json({
                            status       : "OK",
                            message      : "Coupon deleted."
                        });
                    })
                    .catch(function (error) {
                        res.status(200).json({
                            status: "ERROR",
                            message: IS_DEV ? error : "Error deleting coupon."
                        });
                    });
            } else {
                res.status(404).json({
                    status: "ERROR",
                    message: "Coupon not found."
                });
            }
        })
        .catch(function (error) {
            res.status(200).json({
                status: "ERROR",
                message: IS_DEV ? error : "Error deleting coupon."
            });
        });
});

module.exports = router;
