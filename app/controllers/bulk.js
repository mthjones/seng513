var db = require('../../config/db'),
config = require('../../config/config');

module.exports = {

    clear: function(req, res, next) {  
        if(req.query.password == config.clear_password)
        {
            db.User.destroy().success(function()
            {
                console.log("Deleted Users table.");
            }).error(function(error)
            {
                req.flash('error', 'Error destroying Users Table');
            });
            
            db.Photo.destroy().success(function()
            {
                console.log("Deleted Photos table.");
            }).error(function(error)
            {
                req.flash('error', 'Error destroying Photos Table');
            });
            
            res.render('dbclear');
        }else
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
                }).error(function(error) {
                    throw error;
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
                       throw error;
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
                
                var fileExtension = path.substr(path.lastIndexOf('.') + 1);
                var content_type;
                switch(fileExtension)
                {
                    case 'png': content_type = 'image/png'; break;
                    case 'jpg': 
                    case 'jpeg': content_type = 'image/jpeg'; break;
                    case 'gif': content_type = 'image/gif'; break;
                    default: content_type = null; break;
                }
                
                if(!content_type)
                {
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
                    contentType: content_type
                };
                //console.log(photoBody);
                var photo = db.Photo.build(photoBody);
                photo.save().success(function() {
                    console.log("Saved Photo");
                }).error(function(err) {
                    throw error;
                });
            }
        }
        
        res.redirect(302, '/feed');
    }
};
