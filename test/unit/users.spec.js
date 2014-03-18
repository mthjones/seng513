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
        describe('Follow called with null followee', function(){
            var requestMock, responseMock, nextMock, followeeMock;

            beforeEach(function() {
                requestMock = {query: {}, params: {id: 1}, user: {}};
                responseMock = {status: sinon.spy(), send: sinon.spy(), redirect: sinon.spy()};
                nextMock = {};
                
                followeeMock = { then: {}};
            });

            it('Follow called with param id', function() {
                var addFollowerPromise = Promise.resolve();
                var addFollowerMock = sinon.stub().returns(addFollowerPromise);
                followeeMock.addFollower = addFollowerMock;
                var resolvedPromise = Promise.resolve(followeeMock);
                var findMock = sinon.stub().returns(resolvedPromise);
                
                db.User = {find: findMock, then: sinon.stub()};
                
                ctrl.follow(requestMock, responseMock, nextMock);
                expect(findMock).to.have.been.calledWith(1);
            });
            
            it('Response status 404 with null followee');
            it('Response rendered 404 with null followee');
            
        });
        
        describe('Follow called with actual followee', function(){
            it('Followee addFollower called with request user');
            it('Redirect 302 to feed after follower added to followee');

        });
    });
});