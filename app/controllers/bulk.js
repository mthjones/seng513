var db = require('../../config/db'),
    config = require('../../config/config'),
    _ = require('lodash');

module.exports = {
    clear: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            db.sequelize.sync({force: true}).then(function() {
                res.status(200).send('DB cleared');
            }).catch(function(err) {
                res.status(500).send("Couldn't clear DB");
            });
        } else {
            res.status(401).send("Unauthorized to clear the database");
        }
    },

    usersUpload: function (req, res, next) {
        if (req.query.password == config.clear_password) {
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
        if (req.query.password == config.clear_password) {
            var addBulkPhoto = function (photoObject) {
                db.Photo.create(photoObject).then(function (photo) {
                    db.User.find({where: {id: photoObject.UserId}}).success(function (user) {
                        if (user == null) {
                            console.log("user is null id: " + photoObject.UserId);
                        } else
                            user.addPhoto(photo).then(function () {
                                user.getFeed().then(function (feed) {
                                    feed.addPhoto(photo);
                                });

                                user.getFollower().then(function (followers) {
                                    if (followers.length === 0) {
                                        res.status(200).send('');
                                        return;
                                    }
                                    var respond = _.after(followers.length, function () {
                                        //multiple asynch calls, best way to call this once a bunch of a synch calls are done? In this case: after
                                        //all photos have been uploaded, created, and propagated through the system.
                                        res.status(200).send();
                                    });
                                    followers.forEach(function (follower) {
                                        follower.getFeed().then(function (feed) {
                                            feed.addPhoto(photo);
                                            respond();
                                        });
                                    });
                                });
                            });
                    });
                }).catch(function (err) {
                    res.status(500).send('Internal server error');
                });
            };

            for (var i = 0; i < req.body.length; i++) {
                var unparsedPhoto = req.body[i];
                var path = unparsedPhoto.path;

                var fileExtension = path.substr(path.lastIndexOf('.') + 1);
                var content_type;
                switch (fileExtension) {
                    case 'png':
                        content_type = 'image/png';
                        break;
                    case 'jpg':
                    case 'jpeg':
                        content_type = 'image/jpeg';
                        break;
                    case 'gif':
                        content_type = 'image/gif';
                        break;
                    default:
                        content_type = null;
                        break;
                }

                if (!content_type) {
                    continue;
                }

                var photoBody = {
                    createdAt: new Date(unparsedPhoto.timestamp),
                    filepath: unparsedPhoto.path,
                    name: path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1),
                    UserId: unparsedPhoto.user_id,
                    id: unparsedPhoto.id,
                    contentType: content_type,
                    ext: fileExtension
                };

                addBulkPhoto(photoBody);
            }
        } else {
            res.status(401).send('Unauthorized to bulk add photos');
        }
    }
};
