var db = require('../../config/db'),
    uploader = require('../../lib/image_uploader');

module.exports = {
    newForm: function(req, res, next) {
        res.locals = { error: req.flash('error') };
        res.render('photos/new');
    },

    create: function(req, res, next) {
        console.log(req.files);
        res.redirect(302, '/feed');
    }
};
