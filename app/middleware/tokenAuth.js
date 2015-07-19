/**
 * Verifies token for all API requests
 *
 */
module.exports  = function (req, res, next) {
    "use strict";

    var Account            = require('../models/account');
    var AccountAccessToken = require('../models/accountAccessToken');
    var Bookshelf          = require('../models/index');
    var jwt                = require('jwt-simple');
    var fs                 = require('fs');

    var config  = JSON.parse(fs.readFileSync("./config/api.json", "utf8"));
    var token   = req.headers['x-access-token'];
    var path    = req.originalUrl;
    var exempt  = [
        "/api/v1/accounts/login",
        "/api/v1/accounts/activate"
    ];

    var isExempt = exempt.indexOf(path);
    
    if (isExempt) {
        next();
        return;
    }
    
    var sendErrorResponse = function (resp) {
        next(resp);
    };
    
    if (token) {
        try {
            var config    = req.app.get('config');
            var decoded   = jwt.decode(token, config.account.tokenSecret);
            var expired   = decoded.exp <= Date.now();
            var accountID = decoded.iss;
            
            if (!expired) {
                // Get account based on decoded token account ID
                var model = new Account({
                    id: accountID
                });
                
                model.fetch()
                     .then(function (result) {
                        if (result) {
                            req.account       = result.toJSON();
                            req.account.token = token;
                            
                            next();                            
                        } else {
                            sendErrorResponse({
                                status: 400,
                                message: "Access token not found."
                            });
                        }
                    });
            } else {
                sendErrorResponse({
                    status: 400,
                    message: "Access token expired."
                });
            }
        } catch (err) {
            sendErrorResponse({
                status: 400,
                message: config.env === "development" ? err : "Invalid access token."
            });
        }
    } else {
        sendErrorResponse({
            status: 400,
            message: "Access token required."
        });
    }
};