var db = require('../../config/db'),
    _ =  require('lodash');

const pageSize = 30;

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;
        var render = function (photos, showMore) {
            res.render('photos/list', {photos: photos, nextPage: page + 1, showMore: showMore});
        };

        req.user.getFeed().then(function(feed) {
            // Ugh.
            feed.getPhotoes().then(function(allPhotos) {
                return allPhotos.length;
            }).then(function(count) {
                feed.getPhotoes({offset: (page - 1) * pageSize, limit: pageSize, order: [['Photoes.createdAt', 'DESC']]}).then(function(photos) {
                    var respond = _.after(photos.length, render);

                    if (photos.length === 0) {
                        render([]);
                        return;
                    }

                    photos.forEach(function(photo) {
                        photo.getSharers().then(function(sharers) {
                            photo.getUser().then(function(user) {
                                photo.user = user;
                                photo.sharers = sharers;
                                var showMore = (pageSize * (page - 1)) + photos.length < count;
                                respond(photos, showMore);
                            });
                        });
                    });
                });
            });
        });
    }
};
