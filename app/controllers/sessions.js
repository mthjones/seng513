var passport = require('passport'),
    db = require('../../config/db');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('sessions/new');
    },

    create: passport.authenticate('local', {
        successRedirect: '/feed',
        failureRedirect: '/sessions/new',
        failureFlash: true
    }),

    logout: function(req, res, next) {
        req.logout();
        res.redirect(302, '/sessions/new');
    }
};
