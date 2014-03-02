var passport = require('passport'),
    ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
    db = require('./db');

module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

	app.get('/users/follow', ensureLoggedIn('/sessions/new'), function(req, res, next) {
		db.sequelize.query("SELECT * FROM Users").success(function(myTableRows) {
            var currentUser = req.user.username;
            var currentUserId = req.user.id;
            
            db.Follow_relation.findAll({where: {follower:currentUserId}}).success(function(relation){
                var notFollowedUserArray = new Array();
                var followedUserArray = new Array();
                
                myTableRows.forEach(function(userentry)
                {
                    if(userentry.username != currentUser)
                    {
                        
                        var followFlag = false;
                        if(relation != null){
                            relation.forEach(function(followEntry)
                            {
                                //console.log("user id: " + userentry.id + " FollowEntry followee id: " +followEntry.followee);
                                if(followEntry.followee == userentry.id)
                                {
                                    //The logged in user is already following this found user - add to unfollow list
                                    followedUserArray.push(userentry.username);
                                    followFlag = true;
                                }
                            });
                        }
                        if(!followFlag)
                        {
                            notFollowedUserArray.push(userentry.username);
                        }
                    }  
                });
                
                res.render('users/follow', {
                    notfollowed_userdata: notFollowedUserArray,
                    followed_userdata: followedUserArray
                });
            }); 
		});
    });
    
    app.post('/users/follow/delete', ensureLoggedIn('/sessions/new'), function(req, res, next) {
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
                    });
               });
            });
        });

        res.redirect(302, '/feed');
    });
    
    app.post('/users/follow/new', ensureLoggedIn('/sessions/new'), function(req, res, next) {
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
               });
               
            });
        });

        res.redirect(302, '/feed');
    });
    
    app.get('/users/new', function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('users/new');
    });

    app.post('/users/create', function(req, res, next) {
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
    });

    app.get('/sessions/new', function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('sessions/new');
    });

    app.post('/sessions/create', passport.authenticate('local', {
        successRedirect: '/feed',
        failureRedirect: '/sessions/new',
        failureFlash: true
    }));

    app.get('/feed', ensureLoggedIn('/sessions/new'), function(req, res, next) {
        res.locals = {
            photoRows: [[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]]]
        };
        res.render('photos/list');
    });
	
	app.get('/logout', ensureLoggedIn('/sessions/new'), function(req, res, next) {
		req.logout()
		res.redirect(302, '/sessions/new');
	});
};
