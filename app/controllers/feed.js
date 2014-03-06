var db = require('../../config/db');

module.exports = {
    show: function(req, res, next) {
        var nextPage = req.query.page ? parseInt(req.query.page) + 1 : 1;
        req.user.getFeed().then(function(feed) {
            feed.getPhotoes().then(function(photos) {
                res.render('photos/list', {photos: photos, nextPage: nextPage});
            });
        });
    }
};
