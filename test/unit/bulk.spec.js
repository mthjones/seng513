var expect = require('chai').expect,
    sinon = require('sinon'),
    ctrl = require('../../app/controllers/bulk');

describe('Bulk Controller', function() {
    describe('no password specified', function() {
        it('sends unauthorized response', function() {
            var requestMock = {query: {}};
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sinon.spy()};
            ctrl.clear(requestMock, responseMock);
            expect(statusMock.calledWith(401)).to.equal(true);
        });
        it('sends the correct message', function()
        {
            var requestMock = {query: {}};
            var sendMock = sinon.spy();
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sendMock};
            ctrl.clear(requestMock, responseMock);
            expect(sendMock.calledWith("Unauthorized to clear the database")).to.equal(true);
        });
    });
    describe('incorrect password', function() {
        it('sends unauthorized response', function() {
            var requestMock = {query: {password: '0000'}};
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sinon.spy()};
            ctrl.clear(requestMock, responseMock);
            expect(statusMock.calledWith(401)).to.equal(true);
        });
        it('sends the correct message', function()
        {
            var requestMock = {query: {password: '0000'}};
            var sendMock = sinon.spy();
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sendMock};
            ctrl.clear(requestMock, responseMock);
            expect(sendMock.calledWith("Unauthorized to clear the database")).to.equal(true);
        });
    });

    describe('correct password', function() {
        it('calls sync with force clear');
        it('sends ok response with successful clear');
        it('sends correct message with successful clear');
        it('sends internal server error with failed clear');
        it('sends correct message with failed clear');
    });
});
