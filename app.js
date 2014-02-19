var express = require('express');
var config = require('./config/config');

var app = express();

app.listen(config.port);
