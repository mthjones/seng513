var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    chaiAsPromised = require('chai-as-promised'),
    Promise = require('bluebird'),
    ctrl = require('../../app/controllers/bulk'),
    db = require('../../config/db');

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('Bulk Controller', function() {
    describe('no password specified', function() {
        var requestMock, responseMock;

        beforeEach(function() {
            requestMock = {query: {}};
            responseMock = {status: sinon.spy(), send: sinon.spy()};
        });

        it('sends unauthorized response', function() {
            ctrl.clear(requestMock, responseMock);
            expect(responseMock.status).to.have.been.calledWith(401);
        });

        it('sends the correct message', function() {
            ctrl.clear(requestMock, responseMock);
            expect(responseMock.send).to.have.been.calledWith("Unauthorized to clear the database");
        });
    });
    describe('incorrect password', function() {
        var requestMock, responseMock;

        beforeEach(function() {
            requestMock = {query: {password: '0000'}};
            responseMock = {status: sinon.spy(), send: sinon.spy()};
        });

        it('sends unauthorized response', function() {
            ctrl.clear(requestMock, responseMock);
            expect(responseMock.status).to.have.been.calledWith(401);
        });

        it('sends the correct message', function() {
            ctrl.clear(requestMock, responseMock);
            expect(responseMock.send).to.have.been.calledWith("Unauthorized to clear the database");
        });
    });

    describe('correct password', function() {
        var requestMock, responseMock;

        beforeEach(function() {
            requestMock = {query: {password: '1234'}};
            responseMock = {status: sinon.spy(), send: sinon.spy()};
        });

        it('calls sync with force clear', function()
        {
            var resolvedPromise = Promise.resolve();
            var syncMock = sinon.stub().returns(resolvedPromise);
            db.sequelize = {sync: syncMock};
            ctrl.clear(requestMock, responseMock);
            return resolvedPromise.then(function() {
                expect(syncMock).to.have.been.calledWith({force: true});
            });
        });
        it('sends ok response with successful clear', function() {
            var resolvedPromise = Promise.resolve();
            var syncMock = sinon.stub().returns(resolvedPromise);
            db.sequelize = {sync: syncMock};
            ctrl.clear(requestMock, responseMock);
            return resolvedPromise.then(function() {
                expect(responseMock.status).to.have.been.calledWith(200);
            });
        });
        it('sends correct message with successful clear', function()
        {
            var resolvedPromise = Promise.resolve();
            var syncMock = sinon.stub().returns(resolvedPromise);
            db.sequelize = {sync: syncMock};
            ctrl.clear(requestMock, responseMock);
            return resolvedPromise.then(function() {
                expect(responseMock.send).to.have.been.calledWith('DB cleared');
            });
        });
        it('sends internal server error with failed clear');
        it('sends correct message with failed clear');
    });
});
