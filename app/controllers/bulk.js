var db = require('../../config/db'),
    config = require('../../config/config'),
    _ = require('lodash'),
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
                res.status(500).send("Couldn't clear DB");
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

            var sendResponse = _.after(totalFollows, function() {
                res.status(200).send('Users added');
            });

            var finishedUserCreation = _.after(users.length, function() {
                users.forEach(function(user) {
                    user.follows.forEach(function(followeeId) {
                        db.User.find(followeeId).then(function(followee) {
                            db.User.find(user.id).then(function(follower) {
                                followee.addFollower(follower);
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

            var sendResponse = _.after(photos.length, function() {
                res.status(200).send('Streams added');
            });

            photos.forEach(function(unparsedPhoto) {
                var photoBody = {
                    createdAt: new Date(unparsedPhoto.timestamp),
                    filepath: unparsedPhoto.path,
                    name: path.basename(unparsedPhoto.path),
                    id: unparsedPhoto.id,
                    contentType: contentTypeForPath(unparsedPhoto.path),
                    ext: path.extname(unparsedPhoto.path)
                };

                db.Photo.create(photoBody).then(function(photo) {
                    db.User.find(unparsedPhoto.user_id).then(function(user) {
                        user.addPhoto(photo).then(function() {
                            user.getFeed().then(function(feed) {
                                feed.addPhoto(photo);
                            });
                            user.getFollower().then(function(followers) {
                                followers.forEach(function(follower) {
                                    follower.getFeed().then(function(feed) {
                                        feed.addPhoto(photo);
                                    });
                                });
                            });
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
