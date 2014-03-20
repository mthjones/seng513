var chai = require('chai'),
    request = require('superagent'),
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

describe('Redirect to login', function() {
    describe('when not logged in', function() {
        afterEach(function(done) {
            request.get("http://localhost:9000/bulk/clear").query({'password': '1234'}).end(function(res) {
                done();
            });
        });

        it("should redirect away from viewing user", function(done) {
            request.get("http://localhost:9000/users/1").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from following user", function(done) {
            request.get("http://localhost:9000/users/1/follow").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from unfollowing user", function(done) {
            request.get("http://localhost:9000/users/1/unfollow").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from logout", function(done) {
            request.get("http://localhost:9000/logout").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from viewing feed", function(done) {
            request.get("http://localhost:9000/feed").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from photo upload form", function(done) {
            request.get("http://localhost:9000/photos/new").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from photo creation POST endpoint", function(done) {
            request.post("http://localhost:9000/photos/create").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from photo thumbnail viewing", function(done) {
            request.get("http://localhost:9000/photos/thumbnail/1.png").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should redirect away from full photo viewing", function(done) {
            request.get("http://localhost:9000/photos/1.png").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/sessions/new');
                done();
            });
        });

        it("should not redirect away from bulk user upload", function(done) {
            request.post("http://localhost:9000/bulk/users")
                .query({password: '1234'})
                .send([])
                .redirects(0)
                .end(function(response) {
                    expect(response.status).to.equal(200);
                    done();
                });
        });

        it("should not redirect away from bulk stream upload", function(done) {
            request.post("http://localhost:9000/bulk/streams")
                .query({password: '1234'})
                .send([])
                .redirects(0)
                .end(function(response) {
                    expect(response.status).to.equal(200);
                    done();
                });
        });

        it("should not redirect away from bulk clear", function(done) {
            request.get("http://localhost:9000/bulk/clear")
                .query({password: '1234'})
                .redirects(0)
                .end(function(response) {
                    expect(response.status).to.equal(200);
                    done();
                });
        });

        it("should not redirect away from user registration form", function(done) {
            request.get("http://localhost:9000/users/new").redirects(0).end(function(response) {
                expect(response.status).to.equal(200);
                done();
            });
        });

        it("should not redirect away from user creation POST endpoint", function(done) {
            request.post("http://localhost:9000/users/create")
                .send({name: 'test', username: 'test', password: 'test'})
                .redirects(0)
                .end(function(response) {
                    expect(response.status).to.equal(302);
                    expect(response.header['location']).not.to.equal("/sessions/new");
                    done();
                });
        });

        it("should not redirect away from user login", function(done) {
            request.get("http://localhost:9000/sessions/new").redirects(0).end(function(response) {
                expect(response.status).to.equal(200);
                done();
            });
        });

        it("should not redirect away from user login POST endpoint", function(done) {
            var user = {name: 'abc', username: 'abc', password: 'abc'};
            request.post("http://localhost:9000/users/create").send(user).end(function() {
                request.post("http://localhost:9000/sessions/create")
                    .send(user)
                    .redirects(0)
                    .end(function(response) {
                        expect(response.status).to.equal(302);
                        expect(response.header['location']).not.to.equal("/sessions/new");
                        done();
                    });
            });
        });
    });
});
