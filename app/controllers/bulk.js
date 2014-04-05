var db = require('../../config/db'),
    config = require('../../config/config'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    path = require('path');

var contentTypeForPath = function(filepath) {
    var fileExtension = path.extname(filepath);

    if (fileExtension === 'png') return 'image/png';
    if (/jpe?g/.test(fileExtension)) return 'image/jpeg';
    if (fileExtension === 'gif') return 'image/gif';

    return null;
};

module.exports = {
    clear: function (req, res, next) {
        if (req.query.password === config.clear_password) {
            db.sequelize.sync({force: true}).then(function() {
                res.status(200);
                res.send('DB cleared');
            }).catch(function(err) {
                res.status(500);
                res.send("Couldn't clear DB");
            });
        } else {
            res.status(401);
            res.send("Unauthorized to clear the database");
        }
    },

    usersUpload: function (req, res, next) {
        if (req.query.password === config.clear_password) {
            var start = process.hrtime();
            var users = req.body.map(function(user) {
                return { username: user.name, name: user.name, password: user.password, id: user.id, follows: user.follows };
            });

            db.User.bulkCreate(users).then(function() {
                var userPromises = [];
                users.forEach(function(rawUser) {
                    userPromises.push(db.User.f(rawUser.id).then(function(user) {
                        var followerPromises = [];
                        rawUser.follows.forEach(function(followeeId) {
                            followerPromises.push(db.User.f(followeeId).then(function(followee) {
                                user.invalidateFollowers();
                                return followee.addFollower(user);
                            }));
                        });
                        return Promise.all(followerPromises);
                    }));
                });
                return Promise.all(userPromises);
            }).then(function () {
                var end = process.hrtime(start);
                res.status(200).send('Users added in ' + (end[0]*1000 + end[1]/1000000) + 'ms');
            });
        } else {
            res.status(401).send('Unauthorized to bulk add users');
        }
    },

    streamsUpload: function (req, res, next) {
        if (req.query.password === config.clear_password) {
            var start = process.hrtime();
            var idFix = (req.body.length && (req.body[0].id === 0)) ? 1 : 0;
            var photos = req.body.map(function(photo) {
                return {
                    createdAt: new Date(photo.timestamp),
                    filepath: photo.path,
                    name: path.basename(photo.path),
                    id: photo.id + idFix,
                    contentType: contentTypeForPath(photo.path),
                    ext: path.extname(photo.path).split(".").pop(),
                    UserId: photo.user_id
                }
            });

            db.Photo.bulkCreate(photos).then(function() {
                var photoPromises = [];
                photos.forEach(function(rawPhoto) {
                    photoPromises.push(db.Photo.f(rawPhoto.id).then(function(photo) {
                        return db.User.f(photo.UserId).then(function(user) {
                            user.updateFollowers(photo);
                            return user.getCachedFeed().addPhoto(photo);
                        });
                    }));
                });
                return Promise.all(photoPromises);
            }).then(function() {
                var end = process.hrtime(start);
                res.status(200).send('Streams added in ' + (end[0]*1000 + end[1]/1000000) + 'ms');
            });
        } else {
            res.status(401).send('Unauthorized to bulk add photos');
        }
    }
};
