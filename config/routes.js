module.exports = function(app) {
    app.get('/users/new', function(req, res, next) {
        res.render('users/new');
    });
};
