var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var tokenAuth = require('./middleware/tokenAuth');
var exphbs  = require('express-handlebars');
var fs = require('fs');
var app = express();

require('./middleware/sessionManager');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

app.engine('handlebars', exphbs({
    extname      : '.html',
    defaultLayout: 'main',
    layoutsDir   : 'views/layouts'
}));

app.set('view engine', 'html');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));

var config = JSON.parse(fs.readFileSync("./config/api.json", 'utf8'));

app.set('config', config);

app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.all('/api/*',                   [bodyParser.json(), tokenAuth]);

app.use('/api/v1/inventory',        require('./routes/api/inventory'));
app.use('/api/v1/locations',        require('./routes/api/location'));
app.use('/api/v1/coupons',          require('./routes/api/coupon'));
app.use('/api/v1/accounts',         require('./routes/api/account'));
//app.use('/api/v1/accounts/avatar',  require('./routes/api/avatar'));
app.use('/api/v1/session',          require('./routes/api/session'));

app.all('/*', function (req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('public/index.html', { root: __dirname });
});

process.on('error', function (e) {
    console.log(e.stack);
});

// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found!');
    err.status = 404;
    next(err);
});

// error handlers

/*
process.stderr.on('data', function(data) {
    console.log(data);
});
*/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        
        if (err.status === 400) {
            res.status(400).json({
                status : "ERROR",
                message: err.message
            });
        } else {
            next();
        }
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if (err.status !== 400) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});

module.exports = app;
