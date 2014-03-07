var db = require('../../config/db'),
    config = require('../../config/config'),
    _ = require('lodash');
    

module.exports = {

    clear: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            db.User.destroy().success(function () {
                console.log("Deleted Users table.");
            }).error(function (error) {
                req.flash('error', 'Error destroying Users Table');
            });

            db.Photo.destroy().success(function () {
                console.log("Deleted Photos table.");
            }).error(function (error) {
                req.flash('error', 'Error destroying Photos Table');
            });
            
            db.Feed.destroy().success(function () {
                console.log("Deleted Feeds table.");
            }).error(function (error) {
                req.flash('error', 'Error destroying Feeds Table');
            });
            
            db.sequelize.query("DELETE FROM feedsphotoes WHERE 1=1").success(function()
            {
                console.log("Deleted feedsphotoes table.");
            }).error(function(error)
            {
                req.flash('error', 'Error feedsphotoes following Table');
            });
            
            db.sequelize.query("DELETE FROM userFollowers WHERE 1=1").success(function()
            {
                console.log("Deleted following table.");
            }).error(function(error)
            {
                req.flash('error', 'Error destroying following Table');
            });

            res.render('dbclear');
        } else
            res.redirect(302, '/feed');
    },

    usersUpload: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            console.log("bulk users post request");
            
            var respond = _.after(req.body.length, function()
            {
                var AddFollower = function(followeeid, followerid)
                {
                    //console.log("eeid: " + followeeid + " erid: " + followerid);
                    db.User.find({where: {id: followerid}}).success(function(follower)
                    {
                        db.User.find({where: {id:followeeid}}).success(function(followee)
                        {
                            //console.log("ASYNC: eeid: " + followeeid + " erid: " + followerid);
                            followee.addFollower(follower);
                        });
                    });
                }
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
                    db.Feed.create().then(function(feed)
                    {
                        user.setFeed(feed);
                    });
                    
                    respond();
                }).error(function (error) {
                    throw error;
                });
            }
        }
        res.redirect(302, '/feed');
    },

    streamsUpload: function (req, res, next) {
        if (req.query.password == config.clear_password) {
            console.log("bulk streams post request");
            
            var addBulkPhoto = function(photoObject)
            {
                db.Photo.create(photoObject).then(function(photo) {
                    
                    db.User.find({where: {id: photoObject.UserId}}).success(function(user)
                    {
                        if(user == null)
                        {
                            console.log("user is null id: " + photoObject.UserId);
                        }else
                        user.addPhoto(photo).then(function() {
                            user.getFeed().then(function(feed) {
                                feed.addPhoto(photo);
                            });
                            
                            user.getFollower().then(function(followers) {
                                if (followers.length === 0) {
                                    res.redirect(302, '/feed');
                                    return;
                                }
                                var respond = _.after(followers.length, function() {
                                    //multiple asynch calls, best way to call this once a bunch of a synch calls are done? In this case: after
                                    //all photos have been uploaded, created, and propagated through the system.
                                    res.redirect(302, '/feed');
                                });
                                followers.forEach(function(follower) {
                                    follower.getFeed().then(function(feed) {
                                        feed.addPhoto(photo);
                                        respond();
                                    });
                                });
                            });
                        });
                    });
                }).catch(function(err) {
                    console.log(err);
                    req.flash('error', 'Photo upload error');
                    res.redirect(302, '/photos/new');
                });
            }
            
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
                    console.log("unacceptable file type");
                    continue;
                }

                var photoBody =
                {
                    createdAt: new Date(unparsedPhoto.timestamp),
                    //updatedAt: new Date(unparsedPhoto.timestamp),
                    filepath: unparsedPhoto.path,
                    name: path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1),
                    UserId: unparsedPhoto.user_id,
                    id: unparsedPhoto.id,
                    contentType: content_type,
                    ext: fileExtension
                };
                
                addBulkPhoto(photoBody)
                
                //console.log(photoBody);
                // var photo = db.Photo.build(photoBody);
                // photo.save().success(function () {
                    // console.log("Saved Photo");

                // }).error(function (err) {
                    // throw error;
                // });
            }
        }

        //res.redirect(302, '/feed');
    }
};
