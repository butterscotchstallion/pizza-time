/**
 * Inventory model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');
var inventorySize = require("../models/inventorySize");

var checkit       = new Checkit({
    name    : ['required'],
    price: ['required'],
    sizeTypeID: ['required']
});

var Inventory    = bookshelf.Model.extend({
    tableName  : "inventory",
    
    defaults   : {
    
    },
    
    initialize : function () {
        this.on('saving', this.validateSave);
    },
    
    validateSave: function () {
        return checkit.run(this.attributes);
    },

    size: function () {
        return this.belongsTo(inventorySize, "inventorySizeID");
    }
});

module.exports = Inventory;








