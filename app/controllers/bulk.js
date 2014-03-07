var db = require('../../config/db'),
    config = require('../../config/config'),
    _ = require('lodash');

module.exports = {
    clear: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            db.User.destroy();
            db.Photo.destroy();
            db.Feed.destroy();

            db.sequelize.query("DELETE FROM feedsphotoes WHERE 1=1");
            db.sequelize.query("DELETE FROM userFollowers WHERE 1=1");

            res.status(200).send('DB cleared');
        } else {
            res.status(401).send("Unauthorized to clear the database");
        }
    },

    usersUpload: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            var respond = _.after(req.body.length, function () {
                var AddFollower = function (followeeid, followerid) {
                    db.User.find({where: {id: followerid}}).success(function (follower) {
                        db.User.find({where: {id: followeeid}}).success(function (followee) {
                            followee.addFollower(follower);
                        });
                    });
                };
                for (var i = 0; i < req.body.length; i++) {
                    for (var j = 0; j < req.body[i].follows.length; j++) {
                        AddFollower(req.body[i].follows[j], req.body[i].id);
                    }
                }
            });

            for (var i = 0; i < req.body.length; i++) {
                //For each element, create a user, for each user create follows relation:
                var unparsedUser = req.body[i];
                var userBody = {
                    username: unparsedUser.name,
                    name: unparsedUser.name,
                    password: unparsedUser.password,
                    id: unparsedUser.id
                };

                var user = db.User.build(userBody);
                user.save().success(function (user) {
                    db.Feed.create().then(function (feed) {
                        user.setFeed(feed);
                    });

                    respond();
                }).error(function (error) {
                    throw error;
                });
            }
            res.status(200).send('Users added');
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
