var db = require('./db');

module.exports = function(app) {
    app.get('/users/new', function(req, res, next) {
        res.render('users/new');
    });

    app.post('/users/create', function(req, res, next) {
        var user = db.User.build(req.body);
        user.save()
            .success(function() {
                // TODO: Set a session id
                res.redirect(302, '/feed');
            })
            .error(function(err) {
                // TODO: Use connect-flash to get error message for form
                res.redirect(302, '/users/new');
            });
    });
};
