/**
 * account access token model
 *
 */
"use strict";

var Checkit       = require('checkit');
var bookshelf     = require('./index');
var checkit       = new Checkit({
    token    : ['required'],
    expiresAt: ['required'],
    accountID: ['required']
});

var model    = bookshelf.Model.extend({
    tableName    : "account_access_tokens",
    
    hasTimestamps: ['createdAt', 'updatedAt'],
    
    defaults     : {
        active: 1
    },
    
    token        : function () {
        return this.belongsTo("accounts", 'accountID');
    },
    
    initialize   : function () {
        this.on('saving', this.beforeSave);
    },
    
    beforeSave   : function (model) {
        return checkit.run(this.attributes);
    }
});

module.exports = model;








