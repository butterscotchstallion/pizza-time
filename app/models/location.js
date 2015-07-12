/**
 * Location model
 *
 */
"use strict";
var Checkit       = require('checkit');
var bookshelf     = require('./index');
var inventorySize = require("../models/inventorySize");

var checkit       = new Checkit({
    name: ['required']
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








