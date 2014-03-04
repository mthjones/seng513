var db = require('../../config/db'),
    uploader = require('../../lib/image_uploader');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('photos/new');
    },

    create: function(req, res, next) {
        uploader.upload(req).then(function() {
            console.log('uploaded');
        }).catch(function(err) {
            console.log(err);
        });
        res.redirect(302, '/feed');
    }
};
