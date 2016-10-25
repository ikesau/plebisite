/*
 * Dependencies
 **/
var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'ikesaunders',
        password: '',
        database: 'reddit'
    }
});
var reddit = require('../lib/reddit');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');

/*
 * Initialization
 **/
var redditAPI = reddit(knex);
var app = express();
require('../routes/_routes.js')(app, redditAPI);
app.listen(process.env.PORT, function() {
    var port = process.env.PORT || 3000;
    if (process.env.C9_HOSTNAME) {
        console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
    }
    else {
        console.log('Web server is listening on http://localhost:' + port);
    }
});
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static('public'));

/*
 * API
 **/
// redditAPI.createOrUpdateVote({
//     postId:1,
//     userId:2,
//     value: 0})
//     .then(console.log)
//     .catch(console.log);

// redditAPI.getCommentsForPost(1)
//     .then(console.log)
//     .catch(console.log);

// redditAPI.createComment({
//     postId:1,
//     userId:1,
//     parentId:1,
//     content: "Knex rules!"})
//     .then(console.log)
//     .catch(console.log);

// redditAPI.createUser({
//     password: "abcd1234",
//     username: "Dr. Evil"})
//     .then(console.log)
//     .catch(console.log);

// redditAPI.getAllSubreddits()
//     .then(console.log)
//     .catch(console.log);

// redditAPI.createSubredddit({
//     name: "Politics",
//     description: "A total mess"})
//     .then(console.log)
//     .catch(console.log);

// redditAPI.getSinglePost(1)
//     .then(console.log)
//     .catch(console.log);

// redditAPI.getAllPostsForUser(1)
//     .then(console.log)
//     .catch(console.log);

// redditAPI.getAllPosts({sortingMethod:'controversial'})
//     .then(console.log)
//     .catch(console.log);

// redditAPI.createPost({
//     userId: 1,
//     title: "I give up",
//     url: "www.whiteflag.com",
//     subredditId: 1})
//     .then(console.log)
//     .catch(console.log);
