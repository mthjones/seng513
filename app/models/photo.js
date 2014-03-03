module.exports = function(sequelize, DataTypes) {
    var Photo = sequelize.define('Photo', {
        filepath: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Photo.belongsTo(models.User);
            }
        }
    });

    return Photo;
};
