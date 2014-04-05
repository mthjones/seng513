var cluster = require('cluster');

var db = require('./config/db');
db.sequelize.sync({force: false}).complete(function(err) {
    if (err) throw err;
    // Adapted from http://rowanmanning.com/posts/node-cluster-and-express/
    if (cluster.isMaster) {
        require('strong-cluster-connect-store').setup();
        var cpuCount = require('os').cpus().length;

        for (var i = 0; i < cpuCount; i++) {
            cluster.fork();
        }
    } else {
        var express = require('express'),
            config = require('./config/config');

        var app = express();

        require('./config/passport');
        require('./config/express')(app);
        require('./config/routes')(app);

        app.listen(config.port);
    }
});

cluster.on('exit', function(worker) {
    cluster.fork();
});
