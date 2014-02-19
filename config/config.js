var path = require('path');

module.exports = {
    development: {
        port: 9000,
        root: path.normalize(path.join(__dirname, '..'))
    }
};
