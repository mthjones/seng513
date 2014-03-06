var db = require('./db'),
    usersCtrl = require('../app/controllers/users'),
    sessionsCtrl = require('../app/controllers/sessions'),
    feedCtrl = require('../app/controllers/feed'),
    photosCtrl = require('../app/controllers/photos'),
    bulkCtrl = require('../app/controllers/bulk'),
    config = require('./config');

var ensureAuthed = function(req, res, next) {
    if (!req.isAuthenticated()) res.redirect(302, '/sessions/new');
    next();
};
    
module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.redirect(302, '/feed');
    });

    app.get('/bulk/clear', bulkCtrl.clear);
    app.post('/bulk/users', bulkCtrl.usersUpload);
    app.post('/bulk/streams', bulkCtrl.streamsUpload);

    app.get('/users/follow', ensureAuthed, function(req, res, next) {
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

    app.post('/users/follow/new', ensureAuthed, usersCtrl.follow);
    app.post('/users/follow/delete', ensureAuthed, usersCtrl.unfollow);

    app.get('/sessions/new', sessionsCtrl.newForm);
    app.post('/sessions/create', sessionsCtrl.create);
    app.get('/logout', ensureAuthed, sessionsCtrl.logout);

    app.get('/feed', ensureAuthed, feedCtrl.show);

    app.get('/photos/new', ensureAuthed, photosCtrl.newForm);
    app.post('/photos/create', ensureAuthed, photosCtrl.create);
    app.get('/photos/thumbnail/:id.:ext', ensureAuthed, photosCtrl.thumbnail);
    app.get('/photos/:id.:ext', ensureAuthed, photosCtrl.view);
};
