var db = require('../../config/db');

module.exports = {
    show: function(req, res, next) {
        res.locals = {
            photoRows: [[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]]]
        };
        res.render('photos/list');
    }
};
