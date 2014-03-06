var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
    db = require('./db'),
    usersCtrl = require('../app/controllers/users'),
    sessionsCtrl = require('../app/controllers/sessions'),
    feedCtrl = require('../app/controllers/feed'),
    photosCtrl = require('../app/controllers/photos'),
    bulkCtrl = require('../app/controllers/bulk'),
    config = require('./config');
    
module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

    app.get('/bulk/clear', bulkCtrl.clear);
    app.post('/bulk/users', bulkCtrl.usersUpload);
    app.post('/bulk/streams', bulkCtrl.streamsUpload);

    app.get('/users/new', usersCtrl.newForm);
    app.post('/users/create', usersCtrl.create);
    app.get('/users/:id', usersCtrl.view);
    app.get('/users/:id/follow', ensureLoggedIn('/sessions/new'), usersCtrl.follow);
    app.get('/users/:id/unfollow', ensureLoggedIn('/sessions/new'), usersCtrl.unfollow);

    app.get('/sessions/new', sessionsCtrl.newForm);
    app.post('/sessions/create', sessionsCtrl.create);
    app.get('/logout', ensureLoggedIn('/sessions/new'), sessionsCtrl.logout);

    app.get('/feed', ensureLoggedIn('/sessions/new'), feedCtrl.show);

    app.get('/photos/new', ensureLoggedIn('/sessions/new'), photosCtrl.newForm);
    app.post('/photos/create', ensureLoggedIn('/sessions/new'), photosCtrl.create);
    app.get('/photos/thumbnail/:id.:ext', ensureLoggedIn('/sessions/new'), photosCtrl.thumbnail);
    app.get('/photos/:id.:ext', ensureLoggedIn('/sessions/new'), photosCtrl.view);
};
