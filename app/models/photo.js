var moment = require('moment'),
    thumbnailer = require('../../lib/thumbnailer'),
    Promise = require('bluebird'),
    async = require('async'),
    NodeCache = require('node-cache'),
    photoCache = new NodeCache();

module.exports = function(sequelize, DataTypes) {
    var Photo = sequelize.define('Photo', {
        filepath: DataTypes.STRING,
        name: DataTypes.STRING,
        contentType: DataTypes.STRING,
        ext: {
            type: DataTypes.STRING,
            defaultValue: 'jpg'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                Photo.belongsTo(models.User);
                Photo.hasMany(models.Feed);
            },
            // Find by id with caching
            f: function(id) {
                return new Promise(function(resolve, reject) {
                    photoCache.get(id.toString(), function(err, photo) {
                        if (err) reject(err);
                        if (Object.keys(photo).length === 0) {
                            Photo.find(id).then(function(photo) {
                                photoCache.set(id.toString(), photo, function(err, success) {
                                    resolve(photo);
                                });
                            });
                        } else {
                            resolve(Promise.resolve(photo[id.toString()]));
                        }
                    });
                });
            }
        },
        instanceMethods: {
            timeAgo: function() {
               return moment(this.createdAt).fromNow();
            },
            getThumbpath: function() {
                return './images/thumbs/' + this.id + '.thumb.' + this.ext;
            },
            getThumb: function() {
                return thumbnailer.getThumb(this);
            },
            createThumb: function() {
                return thumbnailer.createThumb(this);
            }
        },
        hooks: {
            afterCreate: function(photo, fn) {
                photoCache.set(photo.id.toString(), photo);
                fn(null, photo);
            }
        }
    });

    return Photo;
};
