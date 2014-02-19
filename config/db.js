var fs = require('fs'),
    path = require('path'),
    Sequelize = require('sequelize'),
    lodash = require('lodash'),
    config = require('./config');

var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
    dialect: config.db.adapter,
    port: config.db.port
});

var db = {};

fs.readdirSync(path.join(config.root, 'app', 'models')).filter(function(file) {
    return (file.indexOf('.') !== 0);
}).forEach(function(file) {
    var model = sequelize.import(path.join(config.root, 'app', 'models', file));
    db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

module.exports = lodash.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);
