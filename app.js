var cluster = require('cluster');

require('strong-cluster-connect-store').setup();

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;

    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
} else {
    var express = require('express'),
        config = require('./config/config'),
        db = require('./config/db');

    var app = express();

    require('./config/passport');
    require('./config/express')(app);
    require('./config/routes')(app);

    db.sequelize.sync({force: false}).complete(function(err) {
        if (err) throw err;
        app.listen(config.port);
    });
}
