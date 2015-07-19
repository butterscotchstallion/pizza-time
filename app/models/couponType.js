/**
 * CouponType model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');

var checkit       = new Checkit({
    name: ['required'],
    code: ['required']
});

var CouponType    = bookshelf.Model.extend({
    idAttribute: "id",

    tableName  : "coupon_types",
    
    defaults   : {
    
    },
    
    initialize : function () {
        this.on('saving', this.validateSave);
    },
    
    validateSave: function () {
        return checkit.run(this.attributes);
    }
});

module.exports = CouponType;








