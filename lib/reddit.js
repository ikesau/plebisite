var bcrypt = require('bcrypt-as-promised'); // using promise-based bcrypt
const HASH_ROUNDS = 10;

module.exports = function RedditAPI(knex) {

    return {
        createUser: function(user) {

            return bcrypt.hash(user.password, HASH_ROUNDS)
                .then(hashedPassword => {
                    return knex('users').insert({
                            username: user.username,
                            password: hashedPassword,
                            createdAt: knex.fn.now(),
                            updatedAt: knex.fn.now()
                        })
                        .then(result => {
                            return knex.select('id AS userId', 'username', 'createdAt as userCreatedAt', 'updatedAt AS userUpdatedAt')
                                .from('users')
                                .where('id', result[0]);
                        });
                });
        },
        createSubredddit: function(subreddit) {
            return knex('subreddits').insert({
                    name: subreddit.name,
                    description: subreddit.description,
                    createdAt: knex.fn.now(),
                    updatedAt: knex.fn.now()
                })
                .then(result => {
                    return knex.select('id AS subredditId', 'name AS subredditName', 'description AS subredditDescription', 'createdAt AS subredditCreatedAt', 'updatedAt AS subredditUpdatedAt')
                        .from('subreddits')
                        .where('id', result[0]);
                })
                .then(subreddit => {
                    return subreddit[0];
                });
        },
        createPost: function(post) {
            var postId;
            return knex('posts').insert({
                    userId: post.userId,
                    title: post.title,
                    url: post.url,
                    subredditId: post.subredditId,
                    createdAt: knex.fn.now(),
                    updatedAt: knex.fn.now()
                })
                .then(result => {
                    postId = result[0];
                    return knex('votes').insert({
                        postId: postId,
                        userId: post.userId,
                        vote: 1,
                        createdAt: knex.fn.now(),
                        updatedAt: knex.fn.now()
                    });
                })
                .then(result => {
                    return knex.select('posts.id AS postId', 'title AS postTitle', 'url AS postUrl', 'posts.createdAt AS postCreatedAt', 'posts.updatedAt AS postUpdatedAt', knex.raw('SUM(votes.vote) AS postTotalVotes'))
                        .from('posts')
                        .leftJoin('votes', 'posts.id', 'votes.postId')
                        .where('posts.id', postId);
                });
        },
        createComment: function(comment) {
            if (!comment.parentId) {
                comment.parentId = null;
            }

            return knex('comments').insert({
                    content: comment.content,
                    userId: comment.userId,
                    postId: comment.postId,
                    parentId: comment.parentId,
                    createdAt: 'now()',
                    updatedAt: 'now()'
                })
                .then(result => {
                    return knex.select('comments.id AS commentId', 'comments.content AS commentContent', 'comments.userId AS commentUserId', 'comments.postId AS commentPostId', 'comments.parentId AS commentParentId', 'comments.createdAt AS commentCreatedAt', 'comments.updatedAt AS commentUpdatedAt')
                        .from('comments')
                        .where('comments.id', result);
                });
        },
        createOrUpdateVote: function(vote) { //{value:number, postId:string, userId:number}
            if ([-1, 0, 1].indexOf(vote.value) === -1) {
                throw new Error("You can only vote on something with a weight of 1");
            }

            return knex.raw('INSERT INTO votes SET postId = ?, userId = ?, vote = ? ON DUPLICATE KEY UPDATE vote = ?;', [vote.postId, vote.userId, vote.value, vote.value])
                .then(result => {
                    return knex.select('posts.id AS postId', 'posts.title AS postTitle', 'posts.url AS postUrl', 'posts.userId AS postUserId', 'posts.subredditId AS postSubredditId', 'posts.createdAt AS postCreatedAt', 'posts.updatedAt AS postUpdatedAt')
                        .from('posts')
                        .where('posts.id', vote.postId)
                        .then(post => {
                            return post;
                        });
                });
        },
        getAllPosts: function(options) { //{numPerPage:number, page:number, sortingMethod[top, hot, fresh, controversial]}

            if (!options) {
                options = {};
            }

            var sortingMethods = {
                top: 'voteScore',
                hot: 'SUM(votes.vote) / (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(posts.createdAt))',
                fresh: 'posts.createdAt',
                controversial: `CASE
                                WHEN (SUM(CASE WHEN votes.vote = 1 THEN 1 ELSE 0 END) < SUM(CASE WHEN votes.vote = -1 THEN 1 ELSE 0 END))
                                THEN SUM(votes.vote) * SUM(CASE WHEN votes.vote = 1 THEN 1 ELSE 0 END) / SUM(CASE WHEN votes.vote = -1 THEN 1 ELSE 0 END)
                                ELSE SUM(votes.vote) * SUM(CASE WHEN votes.vote = -1 THEN 1 ELSE 0 END) / SUM(CASE WHEN votes.vote = 1 THEN 1 ELSE 0 END)
                                END`,
            };

            var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
            var offset = (options.page || 0) * limit; // offset results by size (and number) of pages
            var sortingMethod = (options[sortingMethods.sortingMethod] || sortingMethods.top);

            return knex.select('posts.id AS postId', 'title AS postTitle', 'url AS postUrl', 'posts.createdAt AS postCreatedAt', 'posts.updatedAt AS postUpdatedAt',
                    'users.id AS userId', 'users.username AS username', 'users.createdAt AS userCreatedAt', 'users.updatedAt AS userUpdatedAt',
                    'subreddits.id AS subredditId', 'subreddits.name AS subredditName', 'subreddits.description AS subredditDescription', 'subreddits.createdAt AS subredditCreatedAt', 'subreddits.updatedAt AS subredditUpdatedAt',
                    knex.raw('SUM(CASE WHEN votes.vote = 1 THEN 1 ELSE 0 END) AS upvotes'),
                    knex.raw('SUM(CASE WHEN votes.vote = -1 THEN 1 ELSE 0 END) AS downvotes'),
                    knex.raw('SUM(votes.vote) AS voteScore'))
                .from('posts')
                .innerJoin('users', 'posts.userId', 'users.id')
                .innerJoin('subreddits', 'posts.subredditId', 'subreddits.id')
                .leftJoin('votes', 'posts.id', 'votes.postId')
                .groupBy('posts.id')
                .orderByRaw(sortingMethod)
                .limit(limit)
                .offset(offset)
                .then(results => {
                    return results.map(function(currentPost) {
                        return {
                            postId: currentPost.postId,
                            title: currentPost.postTitle,
                            url: currentPost.postUrl,
                            createdAt: currentPost.postCreatedAt,
                            updatedAt: currentPost.postUpdatedAt,
                            upvotes: currentPost.upvotes,
                            downvotes: currentPost.downvotes,
                            totalVotes: currentPost.voteScore,
                            user: {
                                id: currentPost.userId,
                                username: currentPost.username,
                                createdAt: currentPost.userCreatedAt,
                                updatedAt: currentPost.userUpdatedAt
                            }
                        };
                    });
                });
        },
        getAllPostsForUser: function(userId, options) {

            if (!options) {
                options = {};
            }

            var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
            var offset = (options.page || 0) * limit; // offset results by size and number of pages

            return knex.select('posts.id AS postId', 'posts.title AS postTitle', 'posts.url AS postUrl', 'posts.createdAt AS postCreatedAt', 'posts.updatedAt AS postUpdatedAt', 'users.id AS userId', 'users.username AS username', 'users.createdAt AS userCreatedAt', 'users.updatedAt AS userUpdatedAt')
                .from('posts')
                .innerJoin('users', 'posts.userId', 'users.id')
                .where('users.id', userId)
                .orderBy('posts.createdAt', 'desc')
                .limit(limit)
                .offset(offset)
                .then(results => {
                    return results.map(function(currentPost) {
                        return {
                            postId: currentPost.postId,
                            title: currentPost.title,
                            url: currentPost.url,
                            createdAt: currentPost.createdAt,
                            updatedAt: currentPost.updatedAt,
                            user: {
                                id: currentPost.userId,
                                username: currentPost.username,
                                createdAt: currentPost.userCreatedAt,
                                updatedAt: currentPost.userUpdatedAt
                            }
                        };
                    });
                });
        },
        getSinglePost: function(postId) {
            return knex.select('posts.id AS postId', 'posts.title AS postTitle', 'posts.url AS postUrl', 'posts.userId AS postUserId', 'posts.subredditId AS postSubredditId', 'posts.createdAt AS postCreatedAt', 'posts.updatedAt AS postUpdatedAt')
                .from('posts')
                .where('posts.id', postId)
                .limit(1);
        },
        getAllSubreddits: function() {
            return knex.select('id AS subredditId', 'name AS subredditName', 'description AS subredditDescription', 'createdAt AS subredditCreatedAt', 'updatedAt AS subredditUpdatedAt')
                .from('subreddits');
        },
        getCommentsForPost: function(postId) {
            return knex.select('comments.id AS commentId', 'comments.content AS commentContent', 'comments.userId AS commentUserId', 'comments.postId AS commentPostId', 'comments.parentId AS commentParentId', 'comments.createdAt AS commentCreatedAt', 'comments.updatedAt AS commentUpdatedAt')
                .from('comments')
                .where('comments.postId', postId)
                .then(posts => {

                    var sortedReplies = [];
                    var map = {};

                    posts.forEach(function(currentReply) {
                        map[currentReply.commentId] = currentReply; // Creates an object of ID-to-reply pairs
                        currentReply.replies = []; // Adds the 'replies' property to each reply
                    });

                    posts.forEach(function(currentReply) {

                        if (currentReply.commentParentId != null) { // if the current reply has a parent...
                            map[currentReply.commentParentId].replies.push(currentReply); // ... push it to its parent's 'replies' array
                        }
                        else {
                            sortedReplies.push(currentReply); // otherwise, it's a top-level reply, so just add it to sortedReply
                        }
                    });
                    return sortedReplies;
                });
        }
    };
};
