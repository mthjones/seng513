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

    xdescribe('when logged in', function() {
        var agent = request.agent();
        var user1 = {name:'loggedIn', username:'loggedInUser', password:'loggedInPass'};
        var user2 = {name:'loggedIn2', username:'loggedInUser2', password:'loggedInPass2'};

        before(function(done) {
            agent.post("http://localhost:9000/users/create").send(user1).end(function() {
                agent.post("http://localhost:9000/users/create").send(user2).end(function() {
                    done();
                });
            });
        });

        beforeEach(function(done) {
            agent.post("http://localhost:9000/sessions/create").send(user2).end(function() {
                done();
            });
        });

        it("should not redirect away from viewing user", function(done) {
            agent.get("http://localhost:9000/users/1").redirects(0).end(function(response) {
                expect(response.status).not.to.equal(302);
                done();
            });
        });

        it("should not redirect away from following user", function(done) {
            agent.get("http://localhost:9000/users/1/follow").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/feed');
                done();
            });
        });

        it("should not redirect away from unfollowing user", function(done) {
            agent.get("http://localhost:9000/users/1/unfollow").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).to.equal('/feed');
                done();
            });
        });

        it("should not redirect away from logout", function(done) {
            agent.get("http://localhost:9000/logout").redirects(0).end(function(response) {
                // Does redirect to /sessions/new with 302
                expect(response.status).to.equal(302);
                // Test that we can't access something that does require being logged in to verify we have logged out
                agent.get("http://localhost:9000/feed").end(function(response) {
                    expect(response.redirects).to.contain("http://localhost:9000/sessions/new");
                    done();
                });
            });
        });

        it("should not redirect away from viewing feed", function(done) {
            agent.get("http://localhost:9000/feed").redirects(0).end(function(response) {
                expect(response.status).not.to.equal(302);
                done();
            });
        });

        it("should not redirect away from photo upload form", function(done) {
            agent.get("http://localhost:9000/photos/new").redirects(0).end(function(response) {
                expect(response.status).not.to.equal(302);
                done();
            });
        });

        it("should not redirect away from photo creation POST endpoint", function(done) {
            request.post("http://localhost:9000/photos/create").redirects(0).end(function(response) {
                expect(response.status).to.equal(302);
                expect(response.header['location']).not.to.equal('/sessions/new');
                done();
            });
        });

        it("should not redirect away from photo thumbnail viewing", function(done) {
            agent.get("http://localhost:9000/photos/thumbnail/1.png").redirects(0).end(function(response) {
                expect(response.status).not.to.equal(302);
                done();
            });
        });

        it("should not redirect away from full photo viewing", function(done) {

        });

        it("should not redirect away from bulk user upload", function(done) {

        });

        it("should not redirect away from bulk stream upload", function(done) {

        });

        it("should not redirect away from bulk clear", function(done) {

        });

        it("should not redirect away from user registration form", function(done) {

        });

        it("should not redirect away from user creation POST endpoint", function(done) {

        });

        it("should not redirect away from user login", function(done) {

        });

        it("should not redirect away from user login POST endpoint", function(done) {

        });
    });
});
