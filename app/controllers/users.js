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
        //console.log('User: ' + req.user.username + " wants to follow user: " + req.body.usernameInput);

        db.User.find({where: {username: req.user.username}})
            .success(function(user_follower) {
                if (!user_follower)
                {
                    res.redirect(302, '/feed');
                    return;
                }

                db.User.find({where: {username: req.body.usernameInput}})
                    .success(function(user_followee)
                    {
                        if (!user_followee)
                        {
                            res.redirect(302, '/feed');
                            return;
                        }

                        //console.log("Follower: " + user.username + " has id: " + user.id + " --- Followee: " + user2.username + " has id: " + user2.id);
                        var newRelation = {
                            follower: user_follower.id,
                            followee: user_followee.id
                        };
                        var relationRow = db.Follow_relation.build(newRelation);

                        relationRow.save().success(function()
                        {
                            console.log("Saved follow relation");
                        }).error(function(error)
                        {
                            console.log("Error saving follow relation: " + error);
                            throw error;
                        });
                    }).error(function(error)
                    {
                        console.log("Error searching users table");
                        throw error;
                    });
            }).error(function(error)
            {
                console.log("Error searching users table");
                throw error;
            });

        res.redirect(302, '/feed');
    },

    unfollow: function(req, res, next) {
        db.User.find({where: {username: req.user.username}})
            .success(function(user_follower) {
                if (!user_follower)
                {
                    res.redirect(302, '/feed');
                    return;
                }

                db.User.find({where: {username: req.body.usernameInput}})
                    .success(function(user_followee)
                    {
                        if (!user_followee)
                        {
                            res.redirect(302, '/feed');
                            return;
                        }

                        db.Follow_relation.find({where: {follower: user_follower.id, followee:user_followee.id}}).success(function(relation)
                        {
                            relation.destroy().success(function()
                            {
                                //relation deleted
                                console.log("Relation deleted");
                            }).error(function(error)
                            {
                                console.log("Error destroying follow relation");
                                throw error;
                            });
                        }).error(function(error)
                        {
                            console.log("Error searching follow relation table");
                            throw error;
                        });
                    }).error(function(error)
                    {
                        console.log("Error searching users table");
                        throw error;
                    });
            }).error(function(error)
            {   
                console.log("Error searching users table");
                throw error;
            });

        res.redirect(302, '/feed');
    }
};
