var db = require('../../config/db'),
config = require('../../config/config');

module.exports = {

    clear: function(req, res, next) {  
        if(req.query.password == config.clear_password)
        {
            db.User.destroy().success(function()
            {
                console.log("Deleted Users table.");
            });
            
            db.Follow_relation.destroy().success(function()
            {
                console.log("Deleted Follow_relation table.");
            });
            
            console.log("Clear db here");
            //res.render('bulk/clear');
        }
        
         res.redirect(302, '/feed');
    },
    
    usersUpload: function(req,res,next){
        if(req.query.password == config.clear_password)
        {
            console.log("bulk users post request");
            for(var i = 0 ; i < req.body.length;i++)
            {
                //For each element, create a user, for each user create follows relation:
                var unparsedUser = req.body[i];
                var userBody = 
                {
                    username: unparsedUser.name,
                    name: unparsedUser.name,
                    password: unparsedUser.password,
                    id: unparsedUser.id
                };
                
                var user = db.User.build(userBody);
                user.save().success(function() {
                    //return res.redirect(302, '/feed');
                }).error(function(err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        //req.flash('error', 'Username taken');
                    }
                    //res.redirect(302, '/users/new');
                });
                
                for(var j = 0 ; j < unparsedUser.follows.length;j++)
                {
                    var followsBody = {
                                        followee:unparsedUser.follows[j], 
                                        follower:unparsedUser.id 
                                      };
                    
                    var f = db.Follow_relation.build(followsBody);
                    f.save().success(function()
                    {
                        //console.log("Saved follow");
                    }).error(function(error)
                    {
                       //error
                    });
                }   
            }
        }
        res.redirect(302, '/feed');
    },
    
    streamsUpload: function(req,res,next){
        if(req.query.password == config.clear_password)
        {
            console.log("bulk streams post request");
            
            for(var i = 0 ; i < req.body.length;i++)
            {
                var unparsedPhoto = req.body[i];
                var path = unparsedPhoto.path;
                
                var photoBody = 
                {
                    createdAt: unparsedPhoto.timestamp,
                    updatedAt: unparsedPhoto.timestamp,
                    filepath: unparsedPhoto.path,
                    name: path.substr(path.lastIndexOf("/") + 1, path.lastIndexOf(".") - path.lastIndexOf("/") - 1),
                    UserId: unparsedPhoto.user_id,
                    id: unparsedPhoto.id,
                    contentType: path.substr(path.lastIndexOf('.') + 1)
                };
                
                var photo = db.Photo.build(photoBody);
                photo.save().success(function() {
                    console.log("Saved Photo");
                }).error(function(err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        //req.flash('error', 'Username taken');
                    }
                    //res.redirect(302, '/users/new');
                });
                
                console.log(photoBody);
            }
            
            //res.render('bulk/clear');
        }
        
        res.redirect(302, '/feed');
    }
};
