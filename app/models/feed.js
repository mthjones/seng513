module.exports = function(sequelize, DataTypes) {
    var Feed = sequelize.define('Feed', {

    }, {
        classMethods: {
            associate: function(models) {
                Feed.belongsTo(models.User);
                Feed.hasMany(models.Photo);
            }
        }
    });

    return Feed;
};
