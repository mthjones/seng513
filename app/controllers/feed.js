var db = require('../../config/db'),
    _ =  require('lodash');

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var render = function (photos) {
            res.render('photos/list', {photos: photos, nextPage: page + 1});
        };

        req.user.getFeed().then(function(feed) {
            feed.getPhotoes({offset: (page - 1) * 30, limit: 30}).then(function(photos) {
                var respond = _.after(photos.length, render);

                if (photos.length === 0) {
                    render([]);
                    return;
                }

                photos.forEach(function(photo) {
                    photo.getUser().then(function(user) {
                        photo.user = user;
                        respond(photos);
                    });
                });
            });
        });
    }
};
