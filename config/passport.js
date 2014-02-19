var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./db');

passport.use(new LocalStrategy(function(username, password, done) {
    db.User.find({where: {username: username}})
        .success(function(user) {
            if (!user) {
                return done(null, false, {message: 'Incorrect username'});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect password'});
            }
            return done(null, user);
        })
        .error(done);
}));
