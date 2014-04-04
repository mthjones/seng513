var NodeCache = require('node-cache'),
    feedViewCache = new NodeCache();

var FeedCache = function() {
    this._cache = {};
};

FeedCache.prototype.set = function(user, page, view, cb) {
    this._cache[user] = this._cache[user] || {};
    this._cache[user][page] = view;
    cb(null, true);
};

FeedCache.prototype.get = function(user, page, cb) {
    if (!this._cache[user] || !this._cache[user][page]) {
        cb(null, {});
    } else {
        cb(null, this._cache[user][page]);
    }
};

FeedCache.prototype.invalidateForUser = function(user, cb) {
    delete this._cache[user];
    cb(null, true);
};

var feedCache = new FeedCache();

module.exports = function(sequelize, DataTypes) {
    var Feed = sequelize.define('Feed', {

    }, {
        classMethods: {
            associate: function(models) {
                Feed.belongsTo(models.User);
                Feed.hasMany(models.Photo);
            },
            getFeedViewCache: function() {
                return feedCache;
            }
        },
        hooks: {
//            afterUpdate: function(feed, fn) {
//                feedCache.invalidateForUser(feed.UserId, function(err, success) {
//                    fn(null, feed);
//                });
//            }
        }
    });

    return Feed;
};
