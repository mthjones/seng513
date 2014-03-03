module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Photo);
            }
        },
        instanceMethods: {
            validPassword: function(password) {
                // TODO: Replace this with hash check
                return this.password === password;
            }
        }
    });

    return User;
};
