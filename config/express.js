var express = require('express'),
    path = require('path'),
    passport = require('passport'),
    flash = require('connect-flash'),
    config = require('./config');

module.exports = function(app) {
    app.configure(function() {
        app.set('port', config.port.toString());

        app.set('views', path.join(config.root, 'app', 'views'));
        app.set('view engine', 'jade');
        app.enable('view cache');

        app.use(express.compress());
        app.use(express.static(path.join(config.root, 'public')));
        app.use(express.cookieParser());
        app.use(express.urlencoded());
        app.use(express.json());
        app.use(express.methodOverride());
        app.use(express.session({secret: 'super-secret', key: 'sid'}));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500);
            res.render('500');
        });
        app.use(function(req, res, next) {
            res.status(404);
            res.render('404');
        });
    });
};
