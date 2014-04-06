var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    chaiAsPromised = require('chai-as-promised'),
    Promise = require('bluebird'),
    ctrl = require('../../app/controllers/users'),
    db = require('../../config/db');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Users Controller', function() {
    describe('#follow', function() {
        var requestMock, responseMock, nextMock;

        beforeEach(function() {
            requestMock = {query: {}, params: {id: 1}, user: {}};
            responseMock = {status: sinon.spy(), send: sinon.spy(), redirect: sinon.spy(), render: sinon.spy()};
            nextMock = {};
        });

        it('Follow called with param id', function() {
            var followeeMock = {};
            var addFollowerPromise = Promise.resolve();
            followeeMock.addFollower = sinon.stub().returns(addFollowerPromise);
            followeeMock.invalidateFollowers = sinon.stub();
            var resolvedPromise = Promise.resolve(followeeMock);
            var findMock = sinon.stub().returns(resolvedPromise);
            db.User = {f: findMock, then: sinon.stub()};
            
            ctrl.follow(requestMock, responseMock, nextMock);
            expect(findMock).to.have.been.calledWith(1);
        });
        
        describe('Follow called with null followee', function(){
            it('Response status 404 with null followee', function()
            {
                var resolvedPromise = Promise.resolve(null);
                var findMock = sinon.stub().returns(resolvedPromise);
                db.User = {f: findMock, then: sinon.stub()};
                
                ctrl.follow(requestMock, responseMock, nextMock);
                
                return resolvedPromise.then(function() {
                    expect(responseMock.status).to.have.been.calledWith(404);
                });
            });
            
            it('Response rendered 404 with null followee', function()   
            {
                var resolvedPromise = Promise.resolve(null);
                var findMock = sinon.stub().returns(resolvedPromise);
                db.User = {f: findMock, then: sinon.stub()};
                ctrl.follow(requestMock, responseMock, nextMock);
                
                return resolvedPromise.then(function() {
                    expect(responseMock.render).to.have.been.calledWith('404');
                });
            });
        });
        
        describe('Follow called with actual followee', function(){
            it('Followee addFollower called with request user', function()
            {
                var followeeMock = {};
                var addFollowerPromise = Promise.resolve();
                followeeMock.addFollower = sinon.stub().returns(addFollowerPromise);
                followeeMock.invalidateFollowers = sinon.stub();

                var resolvedPromise = Promise.resolve(followeeMock);
                var findMock = sinon.stub().returns(resolvedPromise);
                db.User = {f: findMock};

                ctrl.follow(requestMock, responseMock, nextMock);
                
                return resolvedPromise.then(function() {
                    expect(followeeMock.addFollower).to.have.been.calledWith(requestMock.user);
                });
            });
            
            it('Redirect 302 to feed after follower added to followee', function()
            {
                var followeeMock = {};
                var addFollowerPromise = Promise.resolve();
                followeeMock.addFollower = sinon.stub().returns(addFollowerPromise);
                followeeMock.invalidateFollowers = sinon.stub();

                var resolvedPromise = Promise.resolve(followeeMock);
                var findMock = sinon.stub().returns(resolvedPromise);
                db.User = {f: findMock};

                ctrl.follow(requestMock, responseMock, nextMock);
                
                return resolvedPromise.then(function() {
                    return addFollowerPromise.then(function()
                    {
                        expect(responseMock.redirect).to.have.been.calledWith(302, '/feed');
                    });
                });
            });
            
        });
    });
});
