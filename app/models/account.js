/**
 * account model
 *
 */
"use strict";

var Checkit            = require('checkit');
var bookshelf          = require('./index');

var checkit            = new Checkit({
    name    : ['required'],
    password: ['required']
});

var account    = bookshelf.Model.extend({
    tableName    : "accounts",
    
    token        : function (token) {
        return this.hasOne("account_access_tokens", "accountID");
    },
    
    hasTimestamps: ['createdAt', 'updatedAt'],
    
    defaults     : {
        active: 1
    },
    
    initialize   : function () {
        this.on('saving', this.beforeSave);
    },
    
    beforeSave : function (model) {
        return checkit.run(this.attributes);
    }
});

module.exports = account;








