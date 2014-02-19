var path = require('path');
var env = process.env.NODE_ENV || "development";

var config = {
    development: {
        port: 9000,
        root: path.normalize(path.join(__dirname, '..')),
        db: {
            adapter: 'mysql',
            name: 'snapgram_dev',
            port: 3306,
            username: 'root',
            password: null
        }
    },
    production: {
        // Fill this in with the server information
    }
};

module.exports = config[env];
