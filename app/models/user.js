var Promise = require('bluebird'),
    NodeCache = require('node-cache'),
    _ = require('lodash'),
    userCache = new NodeCache(),
    async = require('async');

var followerUpdateQueue = async.queue(function(task, callback) {
    task.user.getFollowerIds().then(function(followerIds) {
        var query = "INSERT INTO FeedsPhotoes VALUES ";
        query += followerIds.map(function(id) {
            return "(" + task.photo.id + "," + id + ")";
        }).join(",");
        task.sequelize.query(query).then(function() {
            callback();
        });
    });
}, 64);

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
            },
            getCache: function() {
                return userCache;
            },
            f: function(id) {
                return new Promise(function(resolve, reject) {
                    userCache.get(id.toString(), function(err, user) {
                        if (err) reject(err);
                        if (Object.keys(user).length === 0) {
                            User.find(id).then(function(user) {
                                user.getFeed().then(function(feed) {
                                    user.__feed = feed;
                                    userCache.set(id.toString(), user, function(err, success) {
                                        resolve(user);
                                    });
                                });
                            });
                        } else {
                            resolve(Promise.resolve(user[id.toString()]));
                        }
                    });
                });
            }
        },
        instanceMethods: {
            validPassword: function(password) {
                // TODO: Replace this with hash check
                return this.password === password;
            },
            updateFollowers: function(photo) {
                followerUpdateQueue.push({user: this, photo: photo, sequelize: sequelize});
            },
            getCachedFeed: function() {
                return this.__feed;
            },
            getFollowerIds: function() {
                var _this = this;
                if (this.__followerIds) {
                    return Promise.resolve(this.__followerIds);
                } else {
                    return sequelize.query("SELECT uf.FollowerId FROM UserFollowers uf WHERE uf.UserId = ?", null, {raw: true}, [this.id]).then(function(ids) {
                        _this.__followerIds = _.pluck(ids, 'FollowerId');
                        return _this.__followerIds;
                    });
                }
            },
            invalidateFollowers: function() {
                delete this.__followerIds;
            }
        },
        hooks: {
            afterCreate: function(user, fn) {
                var db = require('../../config/db');
                db.Feed.create().then(function(feed) {
                    user.__feed = feed;
                    userCache.set(user.id.toString(), user);
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
                        user.__feed = feed;
                        userCache.set(user.id.toString(), user);
                        return feed.setUser(user);
                    }));
                });
                Promise.all(promises).then(function() {
                    fn(null, users);
                });
            }
        }
    });

    return User;
};
