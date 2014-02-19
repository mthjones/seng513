module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        classMethods: {
            auth: function(username, password) {
                return User.find({where: {username: username, password: password}});
            }
        }
    });

    return User;
};
