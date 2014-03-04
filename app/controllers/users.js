var db = require('../../config/db');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    },

    create: function(req, res, next) {
        var user = db.User.build(req.body);
        user.save()
            .success(function() {
                req.login(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect(302, '/feed');
                });
            })
            .error(function(err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    req.flash('error', 'Username taken');
                }
                res.redirect(302, '/users/new');
            });
    }
};
