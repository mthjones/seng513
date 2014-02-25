var passport = require('passport'),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
    db = require('./db');

module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

    app.get('/users/new', function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    });

    app.post('/users/create', function(req, res, next) {
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
    });

    app.get('/sessions/new', function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('sessions/new');
    });

    app.post('/sessions/create', passport.authenticate('local', {
        successRedirect: '/feed',
        failureRedirect: '/sessions/new',
        failureFlash: true
    }));

    app.get('/feed', ensureLoggedIn('/sessions/new'), function(req, res, next) {
        res.locals = {
            photoRows: [[]]
        };
        res.render('photos/list', {
            partials: {
                photo: 'photos/partials/photo'
            }
        })
    });
};
