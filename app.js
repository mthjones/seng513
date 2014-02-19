var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db');

var app = express();

require('./config/express')(app);
require('./config/routes')(app);

db.sequelize.sync({force: true}).complete(function(err) {
    if (err) {
        throw err;
    } else {
        app.listen(config.port);
    }
});
