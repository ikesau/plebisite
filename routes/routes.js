var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var express = require('express');
var router = express.Router();
var api = require('../api');

/*
 * Initialization
 **/

router.use(
    bodyParser.urlencoded({
        extended: false
    }),
    cookieParser());

/*
 * Middleware
 **/


router.use(function(request, response, next) {
    if (request.cookies.session) {
        api.getUserFromSession(request.cookies.session)
            .then(result => {
                if (result.length === 0) { // No user matches the cookie
                    next();
                }
                else { // Cookie matches a user
                    request.user = result[0];
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

router.use(function(request, response, next) {
    console.log("Visited by:\n", request.user ? request.user : "Anonymous");
    next();
});
/*
 * Get requests
 **/

router.get('/', function(request, response, next) {
    // request.user.currentSubreddit = null;
    api.getAllPosts()
        .then(posts => {
            response.render('partial/posts/all', {
                posts: posts,
                user: request.user
            });
        });
});

router.get('/create/:type', function(request, response) {
    switch (request.params.type) {
        case 'post':
            // console.log(request.user.currentSubreddit)

            api.getAllSubreddits()
                .then(subreddits => {
                    response.render('partial/create/post', {
                        user: request.user,
                        subreddits: subreddits
                    });
                })
            break;
        case 'user':
            response.render('partial/create/user', {
                user: request.user
            });
            break;
    }
});

router.get('/r/:subreddit', function(request, response) {
    // request.user.currentSubreddit = request.params.subreddit;
    console.log('Current subreddit is:', request.user.currentSubreddit);
    api.getSubredditPosts({
            subreddit: '/r/' + request.params.subreddit
        })
        .then(posts => {
            response.render('partial/posts/subreddit', {
                posts: posts,
                user: request.user
            })
        })
});

router.get('/login', function(request, response, next) {
    if (request.user) {
        response.redirect('/');
    }
    else {
        response.render('partial/login', {
            user: request.user
        });
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
                        response.redirect('/login', {
                            user: request.user
                        });
                    });
            }
        });
});

router.post('/login', function(request, response) {
    api.verifyLogin(request.body.username, request.body.password)
        .then(verification => {
            if (verification.validLogin) {
                api.createSession(verification.userId)
                    .then(session => {
                        response.cookie('session', session.sessionId);
                        response.redirect('/');
                    });
            }
        })
        .catch(reason => {
            console.log(new Date, "There was an error in verifyLogin: ", reason);
            if (reason=="MismatchError: invalid") {
                reason = new Error("your username and password do not match.");
            }
            response.status(400).send("Whoops, something went wrong.\n" + reason.toString());
        });
});

module.exports = router;
