var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
    db = require('./db'),
    usersCtrl = require('../app/controllers/users'),
    sessionsCtrl = require('../app/controllers/sessions'),
    feedCtrl = require('../app/controllers/feed'),
    photosCtrl = require('../app/controllers/photos'),
    config = require('./config');
    
module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

    app.get('/bulk/clear', function(req, res, next) {  
        if(req.query.password == config.clear_password)
        {
            db.User.destroy().success(function()
            {
                console.log("Deleted Users table.");
            });
            console.log("Clear db here");
            res.render('bulk/clear');
        }else
        {
            res.redirect(302, '/feed');
        }
    });
    
    app.post('/bulk/users', function(req,res,next){
        if(req.query.password == config.clear_password)
        {
            console.log("bulk users post request");
            console.log("JSON body: " + JSON.stringify(req.body));
            res.render('bulk/clear');
        }else
        {
            res.redirect(302, '/feed');
        }
    });
    
    app.post('/bulk/streams', function(req,res,next){
        if(req.query.password == config.clear_password)
        {
            console.log("bulk streams post request");
            res.render('bulk/clear');
        }else
        {
            res.redirect(302, '/feed');
        }
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

    app.get('/users/new', usersCtrl.newForm);
    app.post('/users/create', usersCtrl.create);
    app.get('/users/:id', usersCtrl.view);

    app.post('/users/follow/new', ensureLoggedIn('/sessions/new'), usersCtrl.follow);
    app.post('/users/follow/delete', ensureLoggedIn('/sessions/new'), usersCtrl.unfollow);

    app.get('/sessions/new', sessionsCtrl.newForm);
    app.post('/sessions/create', sessionsCtrl.create);
    app.get('/logout', ensureLoggedIn('/sessions/new'), sessionsCtrl.logout);

    app.get('/feed', ensureLoggedIn('/sessions/new'), feedCtrl.show);

    app.get('/photos/new', ensureLoggedIn('/sessions/new'), photosCtrl.newForm);
    app.post('/photos/create', ensureLoggedIn('/sessions/new'), photosCtrl.create);
};
