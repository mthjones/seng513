var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db');

var app = express();

require('./config/passport');
require('./config/express')(app);
require('./config/routes')(app);

db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    if (config.setup) config.setup(db, app);
    app.listen(config.port);
});
