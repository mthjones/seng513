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
        clear_password: "1234"
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
        clear_password: "1234"
    }
};




module.exports = config[env];
