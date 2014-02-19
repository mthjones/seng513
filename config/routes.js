module.exports = function(app) {
    app.get('/users/new', function(req, res, next) {
        res.render('users/new');
    });

    app.post('/users/create', function(req, res, next) {
        res.status(302);
        res.location('/users/new');
        res.send();
    });
};
