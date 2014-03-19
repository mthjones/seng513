var chai = require('chai'),
    expect = chai.expect,
    db = require('../../config/db');

describe('Redirect to login', function() {
    describe('when not logged in', function() {
        it("should redirect away from viewing user");
        it("should redirect away from following user");
        it("should redirect away from unfollowing user");
        it("should redirect away from logout");
        it("should redirect away from viewing feed");
        it("should redirect away from photo upload form");
        it("should redirect away from photo creation POST endpoint");
        it("should redirect away from photo thumbnail viewing");
        it("should redirect away from full photo viewing");

        it("should not redirect away from bulk user upload");
        it("should not redirect away from bulk stream upload");
        it("should not redirect away from bulk clear");
        it("should not redirect away from user registration form");
        it("should not redirect away from user creation POST endpoint");
        it("should not redirect away from user login");
        it("should not redirect away from user login POST endpoint");
    });

    describe('when logged in', function() {
        it("should not redirect away from viewing user");
        it("should not redirect away from following user");
        it("should not redirect away from unfollowing user");
        it("should not redirect away from logout");
        it("should not redirect away from viewing feed");
        it("should not redirect away from photo upload form");
        it("should not redirect away from photo creation POST endpoint");
        it("should not redirect away from photo thumbnail viewing");
        it("should not redirect away from full photo viewing");
        it("should not redirect away from bulk user upload");
        it("should not redirect away from bulk stream upload");
        it("should not redirect away from bulk clear");
        it("should not redirect away from user registration form");
        it("should not redirect away from user creation POST endpoint");
        it("should not redirect away from user login");
        it("should not redirect away from user login POST endpoint");
    });
});
