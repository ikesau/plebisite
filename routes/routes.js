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
                    request.user = result[0] // for server access
                    response.locals.user = result[0]; // for Pug access
                    next();
                }
            });
    }
    else { // No cookie
        if (request.user) {
            delete request.user;
        }
        next();
    }
});

router.use(function(request, response, next) {
    console.log("Visited by:\n", request.user ? request.user : "Anonymous");
    next();
});

router.use(function(request, response, next) {
    api.getAllSubreddits()
        .then(subreddits => {
            response.locals.subreddits = subreddits.map(function(subreddit) {
                return subreddit.subredditName.toLowerCase();
            });
            next();
        });
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
            });
        });
});

router.get('/create/:type', function(request, response) {
    switch (request.params.type) {
        case 'post':

            api.getAllSubreddits()
                .then(subreddits => {
                    response.render('partial/create/post', {
                        subreddits: subreddits
                    });
                });
        case 'user':
            response.render('partial/create/user');
    }
});

router.get('/r/:subreddit', function(request, response) {
    if (request.params.subreddit === 'random') {
        api.getRandomSubreddit()
            .then(randomSubreddit => {
                response.redirect(randomSubreddit.subredditUrl)
            })
    }
    else {
        api.getSubredditPosts({
                subreddit: '/r/' + request.params.subreddit
            })
            .then(posts => {
                response.render('partial/posts/subreddit', {
                    posts: posts,
                    subreddit: request.params.subreddit
                });
            });
    }
});

router.get('/r/:subreddit/:post', function(request, response) {
    api.getCommentsAndPostFromPostId(request.params.post)
        .then(threadObject => {
            response.render('partial/thread/linkPost', {
                post: threadObject.OP[0],
                comments: threadObject.comments,
                subreddit: request.params.subreddit
            });
        });
});

router.get('/r/:subreddit/create/post', function(request, response) {
    if (request.user) {
        response.render('partial/create/subredditPost', {
            subreddit: request.params.subreddit
        });
    }
    else {
        response.send("You must be logged in to create a post.");
    }
});

router.get('/login', function(request, response) {
    console.log("From the login get page, subreddits are: ", response.locals.subreddits);

    if (request.user) {
        response.redirect('/');
    }
    else {
        response.render('partial/login');
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
            if (reason == "MismatchError: invalid") {
                reason = new Error("your username and password do not match.");
            }
            response.status(400).send("Whoops, something went wrong.\n" + reason.toString());
        });
});

router.post('/r/:subreddit/create/post', function(request, response) {
    api.getSubredditBy('name', request.params.subreddit)
        .then(subredditObject => {
            api.createPost({
                    userId: request.user.id,
                    title: request.body.title,
                    url: request.body.url,
                    subredditId: subredditObject.subredditId
                })
                .then(result => {
                    response.redirect(`/r/${request.params.subreddit}`);
                });
        });
});

module.exports = router;
