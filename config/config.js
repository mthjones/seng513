var path = require('path');
var env = process.env.NODE_ENV || "development";

var config = {
    development: {
        envname: "development",
        port: 9000,
        root: path.normalize(path.join(__dirname, '..')),
        db: {
            adapter: 'mysql',
            name: 'snapgram_dev',
            port: 3306,
            username: 'root',
            password: null
        },
        clear_password: 1234,
        setup: function(db, app) {

            return db.User.create({name: 'test', username: 'test', password: 'test'}).success(function(user){
                db.Feed.create().then(function(feed) {
                    user.setFeed(feed).then(function() {
                        db.Photo.create({filepath: '/Users/B-Rett/Code/Images/cat.jpg', name: 'cat', contentType: 'image/jpeg'}).success(function(photo){
                            feed.addPhoto(photo);
                            user.addPhoto(photo);
                        });
                    });
                });
            });




            v.save()
           // return db.Photoes.build({filepath: '/Users/B-Rett/Code/Images/cat.jpg', name: 'cat', contentType: 'image/jpeg'}).save();
        }
    },
    production: {
        envname: "production"
        // Fill this in with the server information
    }
};

module.exports = config[env];
