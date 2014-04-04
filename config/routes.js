var db = require('./db'),
    usersCtrl = require('../app/controllers/users'),
    sessionsCtrl = require('../app/controllers/sessions'),
    feedCtrl = require('../app/controllers/feed'),
    photosCtrl = require('../app/controllers/photos'),
    bulkCtrl = require('../app/controllers/bulk'),
    express = require('express'),
    config = require('./config');

var ensureAuthed = function(req, res, next) {
    if (!req.isAuthenticated()) res.redirect(302, '/sessions/new');
    else next();
};
    
module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

    app.get('/bulk/clear', bulkCtrl.clear);
    app.post('/bulk/users', bulkCtrl.usersUpload);
    app.post('/bulk/streams', bulkCtrl.streamsUpload);

    app.get('/users/new', usersCtrl.newForm);
    app.post('/users/create', usersCtrl.create);
    app.get('/users/:id', ensureAuthed, usersCtrl.view);
    app.get('/users/:id/follow', ensureAuthed, usersCtrl.follow);
    app.get('/users/:id/unfollow', ensureAuthed, usersCtrl.unfollow);

    app.get('/sessions/new', sessionsCtrl.newForm);
    app.post('/sessions/create', sessionsCtrl.create);
    app.get('/logout', ensureAuthed, sessionsCtrl.logout);

    app.get('/feed', ensureAuthed, feedCtrl.show);

    app.get('/photos/new', ensureAuthed, photosCtrl.newForm);
    app.post('/photos/create', ensureAuthed, express.multipart({uploadDir: './images'}), photosCtrl.create);
    app.get('/photos/thumbnail/:id.:ext', ensureAuthed, photosCtrl.thumbnail);
    app.get('/photos/:id.:ext', ensureAuthed, photosCtrl.view);
};
