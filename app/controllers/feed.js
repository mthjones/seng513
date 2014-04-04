var db = require('../../config/db'),
    _ =  require('lodash'),
    Promise = require('bluebird');

const pageSize = 30;

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;

//        db.Feed.getFeedViewCache().get(req.user.id, page, function(err, view) {
//            if (view) {
                req.user.getFeed().then(function(feed) {
                    // feed.getPhotoes({offset: (page - 1) * pageSize, limit: pageSize, order: [['Photoes.createdAt', 'DESC']]}).then(function(photos) {
                    feed.getPhotoes().then(function(allPhotos) {
                        var offset = (page - 1) * pageSize;
                        var photos = _.sortBy(allPhotos, ['createdAt', 'id']).reverse().slice(offset, offset + pageSize);
                        var showMore = (pageSize * (page - 1)) + photos.length < allPhotos.length;

                        var photoPromises = [];
                        photos.forEach(function(photo) {
                            photoPromises.push(photo.getUser().then(function(user) {
                                photo.user = user;
                            }));
                        });

                        Promise.all(photoPromises).then(function() {
                            res.render('photos/list', {photos: photos, nextPage: page + 1, showMore: showMore}, function(err, content) {
                                db.Feed.getFeedViewCache().set(req.user.id, page, content, function(err, success) {
                                    res.send(content);
                                });
                            });
                        });
                    });
                });
//            } else {
//                res.send(view);
//            }
//        });
    }
};
