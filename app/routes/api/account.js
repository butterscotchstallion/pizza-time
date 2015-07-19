/**
 * account API routes
 *
 */
"use strict";

var express            = require('express');
var moment             = require('moment');
var router             = express.Router();
var Account            = require('../../models/account');
var Bookshelf          = require('../../models/index');
var AccountAccessToken = require('../../models/accountAccessToken');
var passwordHasher     = require('password-hash-and-salt');
var url                = require('url');
var _                  = require('underscore');
var jwt                = require('jwt-simple');
var fs                 = require('fs');
var config             = JSON.parse(fs.readFileSync("./config/api.json", 'utf8'));
var IS_DEV             = config.env === "development";
var uuid               = require('node-uuid');
var mailer             = require('../../middleware/accountActivationEmailer');
var Handlebars         = require('handlebars');
var emailTemplate      = fs.readFileSync('./views/accounts/activation-email.html', 'utf8');

function sendSuccessResponse (res, model) {
    res.status(201).json({
        status : "OK",
        message: "Account created.",
        account: {
            name                  : model.get('name'),
            emailAddress          : model.get('emailAddress'),
            guid                  : model.get('guid'),
            createdAt             : model.get('createdAt'),
            updatedAt             : model.get('updatedAt'),
            active                : model.get('active'),
            passwordChangeRequired: model.get('passwordChangeRequired'),
            activationCode        : model.get('activationCode')
        }
    });
}

// Create account
router.post('/', function (req, res, next) {
    var name     = req.body.name;
    var email    = req.body.email;
    var testing  = req.body.testing;
    
    // This will be overwritten when the user follows the activation process
    // Also, the account will be inactive by default so it will not be possible
    // to log in, even if this password was known. It is set for the sole purpose
    // of passing validation.
    var password = "" + ~~(Math.random() * 9999);
    var model    = new Account();
    
    passwordHasher(password).hash(function (error, hash) {
        if (error) {
            res.status(200).json({
                status: "ERROR",
                message: error
            });
        } else {
            var activationCode = uuid.v4();
            var activationLink = config.baseURL + "/accounts/activate/" + activationCode;
            
            model.set({
                name                    : name,
                emailAddress            : email,
                password                : hash,
                guid                    : uuid.v4(),
                activationCode          : activationCode,
                active                  : 0,
                passwordChangeRequired  : 1
            });
            
            model.save()
                 .then(function (result) {
                    var newAccount = result;
                    
                    res.location(['/accounts', 
                                  newAccount.get('guid')].join('/'));
                    
                    // Don't send activation email when testing
                    if (!testing) {
                        // Send activation email
                        var tmp       = Handlebars.compile(emailTemplate);
                        var emailBody = tmp(_.extend({
                            activationLink: activationLink,
                            config: config
                        }, newAccount.toJSON()));
                        
                        mailer.send({
                            mailUsername: config.email.username,
                            mailPassword: config.email.password,
                            from        : config.email.from,
                            to          : email,
                            subject     : config.email.activationEmailSubject,
                            text        : emailBody,
                            html        : emailBody,
                            callback    : function (mailError, info) {
                                if (mailError) {
                                    console.log(mailError);
                                    
                                    res.status(500).json({
                                        status: "ERROR",
                                        message: IS_DEV ? mailError : "Error sending activation email."
                                    });
                                    
                                } else {
                                    if (IS_DEV) {
                                        console.log('Message sent: ' + info.response);
                                    }
                                    
                                    sendSuccessResponse(res, newAccount);
                                }
                            }
                        });
                    } else {
                        sendSuccessResponse(res, newAccount);
                    }
                 })
                 .catch(function (error) {
                    var errorMessage  = "Error creating account.";
                    
                    console.log(error);
                    
                    res.status(200).json({
                        status: "ERROR",
                        message: IS_DEV ? error : errorMessage
                    });
                });
        }
    });
});

// Account by GUID
router.get('/:guid', function (req, res, next) {    
    var guid         = req.params.guid;
    var accountModel = new Account({
        guid  : guid,
        active: 1
    });
    
    /**
     * Fetch an account, and any associated access tokens if the account exists
     *
     */
    accountModel.fetch({
                    require: true
                })
                .then(function (result) {
                    result.set('password', null);
                    
                    var account = result;
                    
                    res.status(200).json({
                        status : "OK",
                        message: null,
                        account: account
                    });
                })
                .catch(function (error) {
                    res.status(404).json({
                        status: "ERROR",
                        message: error
                    });
                });
});

// List of accounts
router.get('/', function (req, res, next) {
    var cols = [
        "guid",
        "name",
        "active",
        "createdAt",
        "updatedAt"
    ];
    
    var qb       = Bookshelf.knex
                            .select(cols)
                            .from('accounts');
    var urlParts = url.parse(req.url, true).query;
    var name     = urlParts.name;
    var email    = urlParts.email;
    var facets   = urlParts.facets;
    
    if (name && name.length > 0) {
        qb.where({
            name: name
        });
    }
    
    if (email && email.length > 0) {
        qb.where({
            email_address: email
        });
    }
    
    qb.orderBy('createdAt', 'DESC');
    
    qb.then(function (result) {
        var payload = {
            status : "OK",
            message: null,
            accounts: result
        };
        
        // Used for validation
        if (facets && facets.indexOf('valid') !== -1) {
            payload.valid = result.length === 0;
        }
        
        res.status(200).json(payload);
    })
    .catch(function (error) {
        res.status(200).json({
            status: "ERROR",
            message: IS_DEV ? error : "Error fetching accounts."
        });
    });
});

// Activate account
router.put('/activate', function (req, res, next) {
    var code     = req.body.activationCode;
    var password = req.body.password;

    if (!code || !password) {
        res.status(400).json({
            status: "ERROR",
            message: IS_DEV ? "No activation code or password." : "Error activating account."
        });
    } else {
        /**
         * Make sure we are only affecting accounts with this activation 
         * code, and accounts that are currently inactive
         *
         */
        var model    = new Account({ 
            activationCode: code,
            active        : 0
        });
        
        model.fetch({
            debug  : true
        })
        .then(function (result) {
            if (result) {
                passwordHasher(password).hash(function (error, hash) {
                    if (error) {
                        res.status(200).json({
                            status: "ERROR",
                            message: IS_DEV ? error : "Error activating account."
                        });
                    } else {
                        /** 
                         * Make user active and set their new password
                         *
                         */
                        model.set({
                            active                : 1,
                            password              : hash,
                            passwordChangeRequired: 0
                        });
                        
                        model.save()
                             .then(function () {
                                res.status(200).json({
                                    status: "OK",
                                    message: "Account activated."
                                });
                             })
                             .catch(function (error) {
                                res.status(200).json({
                                    status: "ERROR",
                                    message: IS_DEV ? error : "Error activating account."
                                });
                            });
                    }
                });
            } else {
                res.status(400).json({
                    status: "ERROR",
                    message: IS_DEV ? "Activation code not found." : "Error activating account."
                });
            }
        })
        .catch(function (error) {
            res.status(500).json({
                status: "ERROR",
                message: IS_DEV ? error : "Error activating account."
            });
        });
    }
});


// Update account
router.put('/:guid', function (req, res, next) {
    var guid   = req.params.guid;
    var active = parseInt(req.body.active, 10);  

    var model  = new Account({ 
        guid: guid
    });
    
    var options = { patch: true, debug: true };
    
    model.fetch()
         .then(function (result) {
            if (result) {
                model.save({
                    active: active
                }, options)
                .then(function (model) {                        
                    res.location(['/accounts', model.get('guid')].join('/'));
                    
                    res.status(200).json({
                        status : "OK",
                        message: "Account updated"
                    });
                })
                .catch(function (error) {
                    res.status(200).json({
                        status: "ERROR",
                        message: error
                    });
                });
            } else {
                res.status(404).json({
                    status: "ERROR",
                    message: "Account not found"
                });
            }
        });
});

// Delete account
router.delete('/:guid', function (req, res, next) {
    var guid = req.params.guid;
    var model = new Account({
        guid: guid
    });
    
    model.fetch({
        require: true
    })
    .then(function (result) {         
        model.destroy()
               .then(function () {
                    res.status(200).json({
                        status       : "OK",
                        message      : "Account deleted."
                    });
                })
                .catch(function (error) {
                    res.status(200).json({
                        status: "ERROR",
                        message: IS_DEV ? error : "Error deleting account."
                    });
                });
    })
    .catch(function (error) {
        res.status(200).json({
            status: "ERROR",
            message: IS_DEV ? error : "Error deleting account."
        });
    });
});


module.exports = router;