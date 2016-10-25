module.exports = function(app, api) {
    app.get('/', function(request, response) {
        api.getAllPosts()
            .then(posts => {
                response.render('partial/posts', {
                    posts: posts
                });
            });
    });
};
