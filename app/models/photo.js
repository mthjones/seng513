var moment = require('moment');

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
                Photo.hasMany(models.User, {as: 'Sharer', through: 'SharedPhotos'});
            }

        },

        instanceMethods: {
            timeAgo: function(){
               return moment(this.createdAt).fromNow()

            }
        }


    });

    return Photo;
};
