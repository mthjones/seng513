var db = require('../../config/db'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    Promise = require('bluebird');

const imageTypes = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml'];

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('photos/new');
    },

    view: function(req, res, next) {
        db.Photo.f(req.params.id).then(function(photo) {
            if (photo === null) {
                res.status(404).render('404');
            } else {
                res.status(200);
                res.setHeader('Content-Type', photo.contentType);
                fs.createReadStream(photo.filepath).pipe(res);
            }
        });
    },

    thumbnail: function(req, res, next) {
        db.Photo.f(req.params.id).then(function(photo) {
            if (photo === null) {
                res.status(404).render('404');
            } else {
                res.status(200);
                res.setHeader('Content-Type', photo.contentType);
                photo.getThumb().then(function(thumb) {
                    res.send(thumb);
                });
            }
        });
    },

    create: function(req, res, next) {
        if (!_.contains(imageTypes, req.files.image.type)) {
            req.flash('error', 'Photo upload error');
            res.redirect(302, '/photos/new');
        } else {
            db.Photo.create({filepath: req.files.image.path, name: req.files.image.name, contentType: req.files.image.type, ext: path.extname(req.files.image.name).split('.').pop()}).then(function(photo) {
                res.redirect(302, '/feed');
                req.user.getCachedFeed().addPhoto(photo);
                req.user.addPhoto(photo);
                photo.createThumb();
                req.user.updateFollowers(photo);
            });
        }
    }
};
