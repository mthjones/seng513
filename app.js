var cluster = require('cluster');

require('strong-cluster-connect-store').setup();

// Adapted from http://rowanmanning.com/posts/node-cluster-and-express/
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

cluster.on('exit', function(worker) {
    cluster.fork();
});
