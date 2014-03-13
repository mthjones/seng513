var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db');

var app = express();

require('./config/passport');
require('./config/express')(app);
require('./config/routes')(app);

db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    app.listen(config.port);
});
