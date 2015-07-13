/**
 * Inventory model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');

var checkit       = new Checkit({
    name    : ['required'],
    price: ['required'],
    sizeTypeID: ['required'],
    inventoryTypeID: ['required'],
    guid: ['required']
});

var Inventory    = bookshelf.Model.extend({
    tableName  : "inventory",

    initialize : function () {
        this.on('saving', this.validateSave);
    },
    
    validateSave: function () {
        return checkit.run(this.attributes);
    },

    hasTimestamps: ['createdAt', 'updatedAt']
});

module.exports = Inventory;








