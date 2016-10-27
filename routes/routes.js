var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var express = require('express');
var router = express.Router();
var api = require('../api');

/*
 * Initialization
 **/

router.use(bodyParser.urlencoded({
    extended: false
}), cookieParser());

/*
 * Middleware
 **/

router.use(function(request, response, next) {
    console.log("Visited");
    next();
});

router.use(function(request, response, next) {
    if (request.cookies.session) {
        api.getUserFromSession(request.cookies.session)
            .then(result => {
                if (result.length === 0) { // No user matches the cookie
                    next();
                }
                else { // Cookie matches a user
                    request.user = result;
                    next();
                }
            });
    }
    else {
        if (request.user) {
            delete request.user;
        }
        next(); // No cookie
    }
});

/*
 * Get requests
 **/

router.get('/', function(request, response, next) {
    api.getAllPosts()
        .then(posts => {
            response.render('partial/posts', {
                posts: posts
            });
        });
});

router.get('/create/:type', function(request, response) {
    switch (request.params.type) {
        case 'post':
            response.render('partial/create/post');
            break;
        case 'user':
            response.render('partial/create/user');
            break;
    }
});

router.get('/login', function(request, response, next) {
    if (request.user) {
        response.redirect('/');
    }
    else {
        response.render('/partial/login');
    }
});

router.get('/logout', function(request, response) {
    api.removeSession(request.cookies.session)
        .then(result => {
            console.log(result);
            response.clearCookie('session').redirect('/');
        });
});

/*
 * Post requests
 **/

router.post('/create/user', function(request, response) {
    api.checkUserExists(request.body.username)
        .then(exists => {
            if (exists) {
                response.status(400).send("Sorry. That username is already taken. Please try adding 69 to the end of it.")
            }
            else {
                api.createUser({
                        username: request.body.username,
                        password: request.body.password
                    })
                    .then(result => {
                        return api.createSession(result.userId);
                    })
                    .then(result => {
                        response.cookie('session', result.sessionId);
                        response.redirect('/login');
                    });
            }
        });
});

router.post('/login', function(request, response) {
    api.verifyLogin(request.body.username, request.body.password)
        .then(status => {
            console.log(status);
        })
        .catch(reason => {
            response.status(400).send(reason);
        });
});

module.exports = router;