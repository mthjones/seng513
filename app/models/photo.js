var moment = require('moment');
module.exports = function(sequelize, DataTypes) {
    var Photo = sequelize.define('Photo', {
        filepath: DataTypes.STRING,
        name: DataTypes.STRING,
        contentType: DataTypes.STRING,
        createdAt: {type: DataTypes.DATE,
                   defaultValue: new Date()}
    }, {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                Photo.belongsTo(models.User);
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
