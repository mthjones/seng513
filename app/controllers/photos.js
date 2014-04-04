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
        var formProcessingTime = process.hrtime(req.startTime);
        console.log('took ' + (formProcessingTime[0]*1000 + formProcessingTime[1]/1000000) + 'ms to parse form');
        db.Photo.create({filepath: req.files.image.path, name: req.files.image.name, contentType: req.files.image.type, ext: path.extname(req.files.image.name).split('.').pop()}).then(function(photo) {
            var photoCreationTime = process.hrtime(req.startTime);
            console.log('took ' + (photoCreationTime[0]*1000 + photoCreationTime[1]/1000000) + 'ms to create photo');
            return req.user.addPhoto(photo).then(function() {
                req.user.updateFollowers(photo);
                return req.user.getFeed().then(function(feed) {
                    return feed.addPhoto(photo).then(function() {
                        var feedUpdateTime = process.hrtime(req.startTime);
                        console.log('took ' + (feedUpdateTime[0]*1000 + feedUpdateTime[1]/1000000) + 'ms to update feed');
                    });
                });
            });
        }).then(function() {
            res.redirect(302, '/feed');
            var totalTime = process.hrtime(req.startTime);
            console.log('took ' + (totalTime[0]*1000 + totalTime[1]/1000000) + 'ms to send response');
        }).catch(function(err) {
            console.log(err);
            req.flash('error', 'Photo upload error');
            res.redirect(302, '/photos/new');
        });
    }
};
