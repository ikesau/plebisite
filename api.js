var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'ikesaunders',
        password: '',
        database: 'reddit'
    }
});

var reddit = require('./lib/reddit');
var redditAPI = reddit(knex);

module.exports = redditAPI;

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

// redditAPI.getAllPosts()
//     .then(console.log)
//     .catch(console.log);

// redditAPI.createPost({
//     userId: 1,
//     title: "I give up",
//     url: "www.whiteflag.com",
//     subredditId: 1})
//     .then(console.log)
//     .catch(console.log);
