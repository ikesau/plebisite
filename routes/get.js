module.exports = function(app) {
    app.get('/test', function(request, response) {
        response.send('Test worked!')
    })
}