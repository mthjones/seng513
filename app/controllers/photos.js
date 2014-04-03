var db = require('../../config/db'),
    fs = require('fs'),
    gm = require('gm'),
    _ = require('lodash'),
    path = require('path');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('photos/new');
    },

    view: function(req, res, next) {
        db.Photo.find(req.params.id).then(function(photo) {
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
        db.Photo.find(req.params.id).then(function(photo) {
            if (photo === null) {
                res.status(404).render('404');
            } else {
                res.status(200);
                res.setHeader('Content-Type', photo.contentType);
                gm(fs.createReadStream(photo.filepath)).size({bufferStream: true}, function(err, size) {
                    var aspect = size.width / size.height;
                    this.resize(400, Math.round(400 / aspect)).stream(function(err, stdout) {
                        stdout.pipe(res);
                    });
                });
            }
        });
    },

    create: function(req, res, next) {
        db.Photo.create({filepath: req.files.image.path, name: req.files.image.name, contentType: req.files.image.type, ext: path.extname(req.files.image.name).split('.').pop()}).then(function(photo) {
            return req.user.addPhoto(photo).then(function() {
                req.user.getFeed().then(function(feed) {
                    feed.addPhoto(photo);
                });
                req.user.getFollower().then(function(followers) {
                    followers.forEach(function(follower) {
                        follower.getFeed().then(function(feed) {
                            feed.addPhoto(photo);
                        });
                    });
                });
            });
        }).then(function() {
            res.redirect(302, '/feed');
        }).catch(function(err) {
            console.log(err);
            req.flash('error', 'Photo upload error');
            res.redirect(302, '/photos/new');
        });
    }
};
