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
            var users = req.body;
            var totalFollows = _.flatten(_.pluck(users, 'follows')).length;

            var responseFn = function () {
                res.status(200).send('Users added');
            };

            if (!users.length) {
                responseFn();
                return;
            }

            var sendResponse = _.after(totalFollows, responseFn);

            var finishedUserCreation = _.after(users.length, function() {
                users.forEach(function(user) {
                    user.follows.forEach(function(followeeId) {
                        db.User.find(followeeId).then(function(followee) {
                            db.User.find(user.id).then(function(follower) {
                                return followee.addFollower(follower);
                            }).then(function() {
                                sendResponse();
                            });
                        });
                    });
                });
            });

            users.forEach(function(user) {
                var userBody = {
                    username: user.name,
                    name: user.name,
                    password: user.password,
                    id: user.id
                };
                db.User.create(userBody).then(function(user) {
                    db.Feed.create().then(function(feed) {
                        user.setFeed(feed);
                        finishedUserCreation();
                    });
                });
            });
        } else {
            res.status(401).send('Unauthorized to bulk add users');
        }
    },

    streamsUpload: function (req, res, next) {
        if (req.query.password === config.clear_password) {
            var photos = req.body;

            var responseFn = function () {
                console.log('sending response');
                res.status(200).send('Streams added');
            };

            if (!photos.length) {
                responseFn();
                return;
            }

            var sendResponse = _.after(photos.length, responseFn);

            var idFix = photos.length && photos[0].id === 0 ? 1 : 0;

            photos.forEach(function(unparsedPhoto) {
                var photoBody = {
                    createdAt: new Date(unparsedPhoto.timestamp),
                    filepath: unparsedPhoto.path,
                    name: path.basename(unparsedPhoto.path),
                    id: unparsedPhoto.id + idFix,
                    contentType: contentTypeForPath(unparsedPhoto.path),
                    ext: path.extname(unparsedPhoto.path).split(".").pop()
                };

                db.Photo.create(photoBody).then(function(photo) {
                    return db.User.find(unparsedPhoto.user_id).then(function(user) {
                        return user.addPhoto(photo).then(function() {
                            return Promise.all([
                                user.getFeed().then(function(feed) {
                                    return feed.addPhoto(photo);
                                }),
                                user.getFollower().then(function(followers) {
                                    return followers.forEach(function(follower) {
                                        return follower.getFeed().then(function(feed) {
                                            return feed.addPhoto(photo);
                                        });
                                    });
                                })
                            ]);
                        });
                    });
                }).then(function() {
                    sendResponse();
                });
            });
        } else {
            res.status(401).send('Unauthorized to bulk add photos');
        }
    }
};
