/**
 * Coupon model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');

var checkit       = new Checkit({
    name: ['required'],
    code: ['required'],
    couponTypeID: ['required']
});

var Coupon    = bookshelf.Model.extend({
    tableName  : "coupons",

    idAttribute: "id",

    defaults   : {
    
    },
    
    initialize : function () {
        this.on('saving', this.validateSave);
    },
    
    validateSave: function () {
        return checkit.run(this.attributes);
    },

    hasTimestamps: ['createdAt', 'updatedAt']
});

module.exports = Coupon;








