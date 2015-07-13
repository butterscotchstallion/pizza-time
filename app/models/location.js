/**
 * Location model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');
var inventorySize = require("../models/inventorySize");

var checkit       = new Checkit({
    name: ['required'],
    address: ['required'],
    zipCode: ['required'],
    minOrderAmount: ['required'],
    hasCarryOut: ['required'],
    hasDelivery: ['required'],
    deliveryFee: ['required']
});

var Location    = bookshelf.Model.extend({
    tableName  : "locations",
    
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

module.exports = Location;








