module.exports = function(app, api) {
    require('./get')(app, api);
    require('./post')(app, api);
};