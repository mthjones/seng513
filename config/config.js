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
            return db.User.build({name: 'test', username: 'test', password: 'test'}).save();
        }
    },
    production: {
        envname: "production"
        // Fill this in with the server information
    }
};

module.exports = config[env];
