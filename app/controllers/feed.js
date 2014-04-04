var db = require('../../config/db'),
    _ =  require('lodash'),
    Promise = require('bluebird');

const pageSize = 30;

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;

        req.user.getFeed().then(function(feed) {
            // feed.getPhotoes({offset: (page - 1) * pageSize, limit: pageSize, order: [['Photoes.createdAt', 'DESC']]}).then(function(photos) {
            feed.getPhotoes().then(function(allPhotos) {
                var offset = (page - 1) * pageSize;
                var photos = _.sortBy(allPhotos, 'createdAt').reverse().slice(offset, offset + pageSize);
                var showMore = (pageSize * (page - 1)) + photos.length < allPhotos.length;

                var photoPromises = [];
                photos.forEach(function(photo) {
                    photoPromises.push(photo.getUser().then(function(user) {
                        photo.user = user;
                    }));
                });

                Promise.all(photoPromises).then(function() {
                    res.render('photos/list', {photos: photos, nextPage: page + 1, showMore: showMore});
                });
            });
        });
    }
};
