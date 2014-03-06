var db = require('../../config/db'),
    _ =  require('lodash');

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;
        req.user.getFeed().then(function(feed) {
            feed.getPhotoes({offset: (page - 1) * 30, limit: 30}).then(function(photos) {
                if (photos.length === 0) {
                    res.render('photos/list', {photos: photos, nextPage: page + 1});
                    return;
                }
                var respond = _.after(photos.length, function(photos, users) {
                    res.render('photos/list', {photos: photos, users: users, nextPage: page + 1});
                });
                var users = {};
                photos.forEach(function(photo) {
                    photo.getUser().then(function(user) {
                        users[photo.id] = user;
                        respond(photos, users);
                    });
                });
            });
        });
    }
};
