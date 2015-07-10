/**
 * Inventory_size model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');

var checkit       = new Checkit({
    name    : ['required'],
    price: ['required'],
    sizeTypeID: ['required']
});

var Inventory_size    = bookshelf.Model.extend({
    tableName  : "inventory_sizes",
    
    defaults   : {
    
    },
    
    initialize : function () {
        this.on('saving', this.validateSave);
    },
    
    validateSave: function () {
        return checkit.run(this.attributes);
    }
});

module.exports = Inventory_size;








