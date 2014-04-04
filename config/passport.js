var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    db = require('./db');

passport.use(new LocalStrategy(function(username, password, done) {
    db.User.f({where: {username: username}})
        .then(function(user) {
            if (!user) {
                return done(null, false, {message: 'Incorrect username'});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect password'});
            }
            return done(null, user);
        })
        .catch(done);
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.User.f(id).then(function(user) {
        done(null, user);
    }).catch(function(err) {
        done(err, null);
    });
});
