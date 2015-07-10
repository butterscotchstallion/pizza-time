/**
 * DB setup
 *
 */
"use strict";
var fs         = require('fs');
var config     = JSON.parse(fs.readFileSync("./config/db-dev.json", 'utf8'));

var knex       = require('knex')({
    client    : 'mysql',
    connection: config
});

var bookshelf  = require('bookshelf')(knex);

module.exports = bookshelf;