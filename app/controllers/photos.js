var db = require('../../config/db'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    Promise = require('bluebird');

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
        db.Photo.create({filepath: req.files.image.path, name: req.files.image.name, contentType: req.files.image.type, ext: path.extname(req.files.image.name).split('.').pop()}).then(function(photo) {
            return req.user.addPhoto(photo).then(function() {
                req.user.getFeed().then(function(feed) {
                    return feed.addPhoto(photo);
                });
                req.user.getFollower().then(function(followers) {
                    var followerPromises = [];
                    followers.forEach(function(follower) {
                        followerPromises.push(follower.getFeed().then(function(feed) {
                            return feed.addPhoto(photo);
                        }));
                    });
                    return Promise.all(followerPromises);
                });
            });
        })
        .then(function() {
            res.redirect(302, '/feed');
        }).catch(function(err) {
            console.log(err);
            req.flash('error', 'Photo upload error');
            res.redirect(302, '/photos/new');
        });
    }
};
