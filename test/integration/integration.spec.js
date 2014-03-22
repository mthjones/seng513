var chai = require('chai'),
    request = require('request'),
    expect = chai.expect;

before(function(done) {
    var express = require('express'),
        config = require('../../config/config'),
        db = require('../../config/db');

    var app = express();

    require('../../config/passport');
    require('../../config/express')(app);
    require('../../config/routes')(app);

    db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
        if (err) throw err;
        app.listen(config.port);
        done();
    });
});

describe('Integration test', function() {
    var agent = request.defaults({jar: request.jar()});

    describe('scenario 1', function() {
        it('works', function(done) {
            var user = {name: 'test', username: 'test', password: 'test'};
            // Create the user and login
            agent.post("http://localhost:9000/users/create", {form: user}, function(err, response, body) {
                expect(response.statusCode).to.equal(302);
                expect(response.headers['location']).to.equal('/feed');
                // Navigate to photo upload form
                agent.get("http://localhost:9000/photos/new", function(err, response, body) {
                    expect(response.statusCode).to.equal(200);
                    // Go to a page that doesn't exist
                    agent.get("http://localhost:9000/hello/world", function(err, response, body) {
                        expect(response.statusCode).to.equal(404);
                        done();
                    });
                });
            });
        });
    });
});
