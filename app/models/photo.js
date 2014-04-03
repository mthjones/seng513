var moment = require('moment'),
    thumbnailer = require('../../lib/thumbnailer'),
    Promise = require('bluebird'),
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
                            resolve(Photo.find(id).then(function(photo) {
                                photoCache.set(photo.id.toString(), photo);
                                return photo;
                            }));
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
            }
        },
        hooks: {
            afterCreate: function(photo, fn) {
                photoCache.set(photo.id.toString(), photo);
                thumbnailer.createThumb(photo).then(function() {
                    fn(null, photo);
                });
            },
            afterUpdate: function(photo, fn) {
                photoCache.set(photo.id.toString(), photo);
                fn(null, photo);
            }
        }
    });

    return Photo;
};
