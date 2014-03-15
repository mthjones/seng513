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
        it('sends unauthorized response', function() {
            var requestMock = {query: {}};
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sinon.spy()};
            ctrl.clear(requestMock, responseMock);
            expect(statusMock).to.have.been.calledWith(401);
        });
        it('sends the correct message', function()
        {
            var requestMock = {query: {}};
            var sendMock = sinon.spy();
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sendMock};
            ctrl.clear(requestMock, responseMock);
            expect(sendMock).to.have.been.calledWith("Unauthorized to clear the database");
        });
    });
    describe('incorrect password', function() {
        it('sends unauthorized response', function() {
            var requestMock = {query: {password: '0000'}};
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sinon.spy()};
            ctrl.clear(requestMock, responseMock);
            expect(statusMock).to.have.been.calledWith(401);
        });
        it('sends the correct message', function()
        {
            var requestMock = {query: {password: '0000'}};
            var sendMock = sinon.spy();
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sendMock};
            ctrl.clear(requestMock, responseMock);
            expect(sendMock).to.have.been.calledWith("Unauthorized to clear the database");
        });
    });

    describe('correct password', function() {
        it('calls sync with force clear');
        it('sends ok response with successful clear', function() {
            var resolvedPromise = Promise.resolve();
            var requestMock = {query: {password: '1234'}};
            var responseMock = {status: sinon.spy(), send: sinon.spy()};
            var syncMock = sinon.stub().returns(resolvedPromise);
            db.sequelize = {sync: syncMock};
            ctrl.clear(requestMock, responseMock);
            return resolvedPromise.then(function() {
                expect(responseMock.status).to.have.been.calledWith(200);
            });
        });
        it('sends correct message with successful clear');
        it('sends internal server error with failed clear');
        it('sends correct message with failed clear');
    });
});
