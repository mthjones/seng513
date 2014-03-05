var db = require('../../config/db'),
    uploader = require('../../lib/image_uploader'),
    fs = require('fs'),
    gm = require('gm');

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
                gm(fs.createReadStream(photo.filepath)).resize(400).stream(function(err, stdout) {
                    stdout.pipe(res);
                });
            }
        });
    },

    create: function(req, res, next) {
        uploader.upload(req).then(function(file) {
            db.Photo.create({filepath: file.filepath, name: file.filename, contentType: file.contentType}).then(function() {
                res.redirect(302, '/feed');
            }).catch(function(err) {
                req.flash('error', 'Photo upload error');
                res.redirect(302, '/photos/new');
            });
        }).catch(function(err) {
            req.flash('error', err);
            res.redirect(302, '/photos/new');
        });
    }
};
