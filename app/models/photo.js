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
                Photo.hasMany(models.Feed);
            }
        }
    });

    return Photo;
};
