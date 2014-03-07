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

                db.Photo.create({filepath: '/Users/B-Rett/Code/Images/cat.jpg', name: 'cat', contentType: 'image/jpeg'}).success(function(photo){
                    user.addPhoto(photo)
                })

                db.Photo.create({filepath: '/Users/B-Rett/Code/Images/eel.jpg', name: 'eel', contentType: 'image/jpeg', createdAt: '2014-03-04 21:49:21'}).success(function(photo){
                    user.addPhoto(photo)
                })

                db.Feed.create().then(function(feed) {
                    user.setFeed(feed);
                });
            });




            


            v.save()

        }
    },
    production: {
        envname: "production",
        port: 8300,
        root: path.normalize(path.join(__dirname, '..')),
        db: {
            adapter: 'mysql',
            name: process.env.SNAPGRAM_DB,
            host: 'web2.cpsc.ucalgary.ca',
            port: 3306,
            username: process.env.SNAPGRAM_USER,
            password: process.env.SNAPGRAM_PASS
        },
        clear_password: 1234
    }
};



module.exports = config[env];
