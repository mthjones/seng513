var Promise = require('bluebird');

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
                User.hasMany(User, {as: 'Follower', through: 'UserFollowers'});
            }
        },
        instanceMethods: {
            validPassword: function(password) {
                // TODO: Replace this with hash check
                return this.password === password;
            }
        },
        hooks: {
            afterCreate: function(user, fn) {
                var db = require('../../config/db');
                db.Feed.create().then(function(feed) {
                    feed.setUser(user).then(function() {
                        fn(null, user);
                    });
                });
            },
            afterBulkCreate: function(users, fields, fn) {
                var db = require('../../config/db');
                var promises = [];
                users.forEach(function(user) {
                    promises.push(db.Feed.create().then(function(feed) {
                        return feed.setUser(user);
                    }));
                });
                Promise.all(promises).then(function() {
                    fn(null, users);
                })
            }
        }
    });

    return User;
};
