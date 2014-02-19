var express = require('express'),
    config = require('./config/config');

var app = express();

require('./config/routes')(app);
require('./config/express')(app);

app.listen(config.port);
