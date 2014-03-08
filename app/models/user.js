module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.hasOne(models.Feed);
                User.hasMany(models.Photo);
                User.hasMany(User, {as: 'Followers', through: 'UserFollowers'});
                User.hasMany(models.Photo, {as: 'SharedPhotos', through: 'SharedPhotos'});
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
