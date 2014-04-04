var db = require('../../config/db'),
    _ =  require('lodash'),
    Promise = require('bluebird');

const pageSize = 30;

module.exports = {
    show: function(req, res, next) {
        var page = req.query.page ? parseInt(req.query.page) : 1;

        req.user.getFeed().then(function(feed) {
            db.sequelize.query("SELECT p.*, u.username FROM Photoes p INNER JOIN FeedsPhotoes fp ON fp.PhotoId = p.id INNER JOIN Users u ON p.UserId = u.id WHERE fp.FeedId = ?", db.Photo, {}, [feed.id]).then(function(allPhotos) {
                var offset = (page - 1) * pageSize;
                var photos = _.sortBy(allPhotos, ['createdAt', 'id']).reverse().slice(offset, offset + pageSize);
                photos.map(function(photo) {
                    photo.user = {id: photo.UserId, name: photo.dataValues.username};
                    return photo;
                });
                var showMore = (pageSize * (page - 1)) + photos.length < allPhotos.length;

                res.render('photos/list', {photos: photos, nextPage: page + 1, showMore: showMore});
            });
        });
    }
};
