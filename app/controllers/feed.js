module.exports = {
    show: function(req, res, next) {
        res.locals = {
            photoRows: [[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]],[[],[],[],[],[]]]
        };
        res.render('photos/list');
    }
};
