var express = require('express'),
    config = require('./config/config');

var app = express();

require('./config/express')(app);
require('./config/routes')(app);

app.listen(config.port);
