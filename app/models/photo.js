var moment = require('moment'),
    thumbnailer = require('../../lib/thumbnailer');

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
            }

        },
        instanceMethods: {
            timeAgo: function() {
               return moment(this.createdAt).fromNow();
            },
            getThumbpath: function() {
                return this.filepath + '.thumb';
            },
            getThumb: function() {
                return thumbnailer.getThumb(this);
            }
        },
        hooks: {
            afterCreate: function(photo, fn) {
                thumbnailer.createThumb(photo).then(function() {
                    fn(null, photo);
                });
            }
        }
    });

    return Photo;
};
