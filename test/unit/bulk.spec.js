var expect = require('chai').expect,
    sinon = require('sinon'),
    ctrl = require('../../app/controllers/bulk');

describe('Bulk Controller', function() {
    describe('incorrect password', function() {
        it('sends unauthorized response', function() {
            var requestMock = {query: {password: '0000'}};
            var statusMock = sinon.spy();
            var responseMock = {status: statusMock, send: sinon.spy()};
            ctrl.clear(requestMock, responseMock);
            expect(statusMock.calledWith(401));
        });
        it('sends the correct message');
    });

    describe('correct password', function() {
        it('calls sync with force clear');
        it('sends ok response with successful clear');
        it('sends correct message with successful clear');
        it('sends internal server error with failed clear');
        it('sends correct message with failed clear');
    });
});
