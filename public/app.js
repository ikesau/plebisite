/*
 * Dependencies
 **/
var express = require('express');
var app = express();
var router = require('../routes/routes');

/*
 * Initialization
 **/

app
    .set('view engine', 'pug')
    .use('/', router, express.static('public'),
        ('/assets', express.static('public')))
    .listen(process.env.PORT, function() {
        var port = process.env.PORT || 3000;
        if (process.env.C9_HOSTNAME) {
            console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
        }
        else {
            console.log('Web server is listening on http://localhost:' + port);
        }
    });
