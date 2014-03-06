var db = require('../../config/db');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    },

    create: function(req, res, next) {
        var user = db.User.build(req.body);
        user.save()
            .success(function() {
                req.login(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect(302, '/feed');
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
        db.User.find(req.params.id).then(function(user) {
            if (user) {
                res.locals = {user: user}

                user.getPhotoes().success(function(photos){
                   console.log(photos[0].id)
                   //res.locals = {photo: photos[0]}
                   res.render('users/view', {photo: photos[0]});

                   // res.locals = {
                     //   photos: [[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]]]
                    //
                    // };
                })



                //res.render('users/view');
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
                req.user.addFollowee(followee).then(function() {
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
                req.user.removeFollowee(followee).then(function() {
                    res.redirect(302, '/feed');
                });
            }
        });
    }
};
