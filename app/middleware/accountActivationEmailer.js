/**
 * accountActivationEmailer - sends email with activation link
 *
 */
"use strict";

var nodemailer                = require('nodemailer');
var accountActivationEmailer  = {};

accountActivationEmailer.send = function (options) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: options.mailUsername,
            pass: options.mailPassword
        }
    });
    
    var mailOptions = options;
    
    transporter.sendMail(mailOptions, mailOptions.callback);
};

module.exports = accountActivationEmailer;