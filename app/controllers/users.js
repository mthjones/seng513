var db = require('../../config/db'),
    _ =  require('lodash');


module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    },

    create: function(req, res, next) {
        var user = db.User.build(req.body);
        user.save()
            .success(function(user) {
                db.Feed.create().then(function(feed) {
                    user.setFeed(feed).then(function() {
                        req.login(user, function(err) {
                            if (err) {
                                return next(err);
                            }
                            return res.redirect(302, '/feed');
                        });
                    });
                });
            })
            .error(function(err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    req.flash('error', 'Username taken');
                }
                res.redirect(302, '/users/new');
            });
    },

    view: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var render = function (user, photos, isFollowing) {
            var showFollow = !!req.user && req.user.id.toString() !== req.params.id;
            res.render('users/view', {user: user, photos: photos, nextPage: page + 1, following: isFollowing, showFollow: showFollow });
        };

        if (req.user) {
            db.User.find(req.params.id).then(function(user) {
                if (user !== null) {
                    user.hasFollower(req.user).then(function(isFollowing) {
                        user.getPhotoes({offset: (page - 1) * 30, limit: 30, order: [['Photoes.createdAt', 'DESC']]}).then(function(photos) {
                            var respond = _.after(photos.length, render);

                            if (photos.length === 0) {
                                render([]);
                                return;
                            }

                            photos.forEach(function(photo) {
                                photo.getUser().then(function(user) {
                                    photo.user = user;
                                    respond(user, photos, isFollowing);
                                });
                            });
                        });
                    });
                } else {
                    res.status(404).render('404');
                }
            });
        } else {
            db.User.find(req.params.id).then(function(user) {
                if (user !== null) {
                    user.getPhotoes({offset: (page - 1) * 30, limit: 30, order: [['Photoes.createdAt', 'DESC']]}).then(function(photos) {
                        var respond = _.after(photos.length, render);

                        if (photos.length === 0) {
                            render([]);
                            return;
                        }

                        photos.forEach(function(photo) {
                            photo.getUser().then(function(user) {
                                photo.user = user;
                                respond(user, photos);
                            });
                        });
                    });
                } else {
                    res.status(404).render('404');
                }
            });
        }
    },


    follow: function(req, res, next) {
        db.User.find(req.params.id).then(function(followee) {
            if (followee === null) {
                res.status(404).render('404');
            } else {
                followee.addFollower(req.user).then(function() {
                    res.redirect(302, '/feed');
                });
            }
        });
    },

    unfollow: function(req, res, next) {
        db.User.find(req.params.id).then(function(followee) {
            if (followee === null) {
                res.status(404).render('404');
            } else {
                followee.removeFollower(req.user).then(function() {
                    res.redirect(302, '/feed');
                });
            }
        });
    }
};
