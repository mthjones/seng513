var Promise = require('bluebird'),
    NodeCache = require('node-cache'),
    _ = require('lodash'),
    userCache = new NodeCache(),
    async = require('async');

var followerUpdateQueue = async.queue(function(task, callback) {
    task.user.getFollowers().then(function(followers) {
        var followerPromises = [];
        followers.forEach(function(follower) {
            follower.getCachedFeed().invalidatePhotos();
            followerPromises.push(follower.getCachedFeed().addPhoto(task.photo));
        });
        Promise.all(followerPromises).then(function() {
            callback();
        });
    });
}, 10);

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
                followerUpdateQueue.push({user: this, photo: photo});
            },
            getCachedFeed: function() {
                return this.__feed;
            },
            getFollowers: function() {
                var _this = this;

                var loadFollowers = function() {
                    var followers = [];
                    var promises = [];
                    _this.__followerIds.forEach(function(id) {
                        promises.push(User.f(id).then(function(user) {
                            followers.push(user);
                        }));
                    });
                    return Promise.all(promises).then(function() {
                        return followers;
                    });
                };

                if (!this.__followerIds) {
                    return sequelize.query("SELECT uf.FollowerId FROM UserFollowers uf WHERE uf.UserId = ?", null, {raw: true}, [this.id]).then(function(ids) {
                        _this.__followerIds = _.pluck(ids, 'FollowerId');
                    }).then(loadFollowers);
                } else {
                    return loadFollowers();
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
