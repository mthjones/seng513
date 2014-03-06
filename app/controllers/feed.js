var db = require('../../config/db');

module.exports = {
    show: function(req, res, next) {
        req.user.getFeed().then(function(feed) {
            feed.getPhotoes().then(function(photos) {
                res.render('photos/list', {photos: photos});
            });
        });
    }
};
