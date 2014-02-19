module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        instanceMethods: {
            validPassword: function(password) {
                // TODO: Replace this with hash check
                return this.password === password;
            }
        }
    });

    return User;
};
