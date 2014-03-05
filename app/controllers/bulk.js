var db = require('../../config/db');

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
    
    userUpload: function(req,res,next){
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
                var followsLength = unparsedUser.follows.length;
                
                function getBody(value)
                {
                    return function(){req.body[value]};
                }
                
                var user = db.User.build(userBody);
                user.save().success(function() {
                    //return res.redirect(302, '/feed');
                }).error(function(err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        //req.flash('error', 'Username taken');
                    }
                    //res.redirect(302, '/users/new');
                });
                
                for(var j = 0 ; j < followsLength;j++)
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
            //res.render('bulk/clear');
        }
        
        res.redirect(302, '/feed');
    }
};
