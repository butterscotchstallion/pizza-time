/**
 * session manager - periodically deletes stale sessions
 *
 */
"use strict";
var Bookshelf = require('../models/index');
var moment    = require('moment');
var ssd       = {};

ssd.init = function () {
    var fiveMinutesInMS = 300000;
    var interval        = fiveMinutesInMS;
    
    setInterval(ssd.destroyStaleSessions, interval); 

    ssd.destroyStaleSessions();
};

ssd.destroyStaleSessions = function () {
    var qb  = Bookshelf.knex('account_access_tokens');
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    qb.where('expiresAt', '<', now);
    
    qb.del()
      .then(function () {
        console.log('successfully destroyed sessions');
      })
      .catch(function (error) {
        console.log('failed to delete stale sessions: ', error);
      });
};


ssd.init();

module.exports = ssd;