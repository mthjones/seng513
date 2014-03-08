var db = require('../../config/db'),
    _ =  require('lodash');

const pageSize = 30;

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    },

    create: function(req, res, next) {
        db.User.create(req.body).success(function(user) {
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
        }).error(function(err) {
            if (err.code === 'ER_DUP_ENTRY') {
                req.flash('error', 'Username taken');
            }
            if (err.name && err.name[0] === 'Validation notEmpty failed: name') {
                req.flash('error', 'Name can not be empty');
            } else if (err.username && err.username[0] === 'Validation notEmpty failed: username') {
                req.flash('error', 'Username can not be empty');
            } else if (err.password && err.password[0] === 'Validation notEmpty failed: password') {
                req.flash('error', 'Password can not be empty');
            }
            res.redirect(302, '/users/new');
        });
    },

    view: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var render = function (user, photos, isFollowing, showMore) {
            var showFollow = req.user.id.toString() !== req.params.id;
            res.render('users/view', {user: user, photos: photos, nextPage: page + 1, following: isFollowing, showFollow: showFollow, showMore: showMore , currentUser: req.user});
        };

        db.User.find({where: {id: req.params.id}, include: [{model: db.Photo, as: 'SharedPhotos'}]}).then(function(user) {
            if (user !== null) {
                user.hasFollower(req.user).then(function(isFollowing) {
                    user.getPhotoes().then(function(allPhotos) {
                        return allPhotos.length;
                    }).then(function(count) {
                        user.getPhotoes({offset: (page - 1) * pageSize, limit: pageSize, order: [
                            ['Photoes.createdAt', 'DESC']
                        ], include: [{model: db.User, as: 'Sharers'}]}).then(function (photos) {
                            var respond = _.after(photos.length, render);

                            if (photos.length === 0) {
                                render(user, []);
                                return;
                            }

                            photos.forEach(function (photo) {
                                photo.getUser().then(function (user) {
                                    photo.user = user;
                                    var showMore = (pageSize * (page - 1)) + photos.length < count;
                                    respond(user, photos, isFollowing, showMore);
                                });
                            });
                        });
                    });
                });
            } else {
                res.status(404).render('404');
            }
        });
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
