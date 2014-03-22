var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db'),
    request = require('superagent'),
    request2 = require('request'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var app = express();

require('./config/passport');
require('./config/express')(app);
require('./config/routes')(app);

if (process.argv.length < 5) {
    console.error("\n\nPlease enter proper arguments! #users testVersion #followerVersion\n" +
        "Where testVersions are: feed, upload, or image, and follower version 1,2,3 \n")
    process.exit(1);
}

var concurrentRequests = process.argv[2];
var testVersion = process.argv[3];
var followerVersion = process.argv[4];

var userAgents = [];
var timingArray = [];
var server;

db.sequelize.sync({force: config.envname === "development"}).complete(function (err) {
    if (err) throw err;
    server = app.listen(config.port);

    var done = function () {
        server.close();
    };

    if (testVersion == "upload") {
        testMultipleUserUploadPhoto(concurrentRequests, function () {
        })
    } else {
        clear(done);
    }

    //testMultipleUserUploadPhoto(100, done);
});


function sendUserRequest(callDone, userAgent) {
    var url = testVersion === "feed" ? "http://localhost:9000/feed" : "http://localhost:9000/"; //MAKE THIS AN IMAGE LINK
    var currentCompleted = 0;

    var callback = function(err, response) {
        console.log("\ngot a feed\n");

        var timeTaken = (process.hrtime()[1] - startTime) / 1000000;
        console.log("current is: " + process.hrtime()[1] + " and startTime was" + startTime + "timeTaken is " + timeTaken)
        console.log(timeTaken);

        timingArray.push(timeTaken);
        currentCompleted++;
        console.log("Done # " + currentCompleted);
        callDone()

    };
    function handle(error) {
        console.log("\n\nYO\n\n");
        console.log(error);
    }

    var startTime = process.hrtime()[1];
    userAgent.get(url).send().end(callback);
}

function test() {
    createNUsers(concurrentRequests, function () {
        //when callDone() gets called concurrentRequests times, done will be called
        var respond = _.after(concurrentRequests, done);

        for (var index = 0; index < userAgents.length; ++index) {
            sendUserRequest(respond, userAgents[index]);
        }
    })
}


function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}

function createNUsers(numUsers, callback) {
    var respond = _.after(numUsers, callback);

    for (var i = 0; i < numUsers; i++) {
        var newUsername = randomString(10);
        createUser(newUsername, '1234', respond);
    }
}

function createUser(newUserName, newPassword, callbackFunction) {
    var user = {name: newUserName, username: newUserName, password: newPassword};
    var url = 'http://localhost:9000/users/create';
//    var userAgent = request.agent();
    var userAgent = request2.defaults({jar: request2.jar()});
    userAgents.push(userAgent);
    var callback = function(response) {
        callbackFunction();
    };

    userAgent.post(url, callback).form(user);

//    userAgent.post(url).send(user).end(callback);
}

function bulkUpload(done) {
    function callback(res) {
        console.log("uploaded");
        test(concurrentRequests);
    }


    var bulkData = '[{"id": 1, "name":"jill", "follows":[3,4,5], "password": "abcdef"},' +
        '{"id": 2, "name":"bill", "follows":[1,3,5], "password": "abcdef"},' +
        '{"id": 3, "name":"james", "follows":[4,5], "password": "abcdef"},' +
        '{"id": 4, "name":"john", "follows":[1], "password": "abcdef"},' +
        '{"id": 5, "name":"luke", "follows":[], "password": "abcdef"}]';

    request.post('http://127.0.0.1:9000/bulk/users?password=1234')
        .set('Content-Type', 'application/json')
        .send(bulkData)
        .end(callback)
}

function uploadPhotoFromUser(userAgent, done) {
    var url = 'http://localhost:9000/photos/create';

    //var startTime = process.hrtime()[1];
    var startD = new Date();

    var callback = function(err, response) {
        var endD = new Date();
        var timeTaken = endD - startD;
        //var timeTaken = (process.hrtime()[1] - startTime)/1000000;
        timingArray.push(timeTaken);
        if (err) console.log(err);
        done();
    };

//    userAgent.post(url).attach('photo', 'images/test2.png', 'test2.png').end(callback);
    var r = userAgent.post(url, callback);
    var form = r.form();
    form.append('photo', fs.createReadStream(path.join(__dirname, 'images', 'test2.png')));
}

function testMultipleUserUploadPhoto(numUsers, done) {
    createNUsers(numUsers, function () {
        var callback = _.after(numUsers, function () {
            console.log("Done uploading all photos");
            output(numUsers);
            done();
        });


        for (var i = 0; i < numUsers; i++) {
            uploadPhotoFromUser(userAgents[i], callback);
        }
    });
}


function output(numUsers) {
    console.log(timingArray);
    var min = Math.round(Math.min.apply(null, timingArray)),
        max = Math.round(Math.max.apply(null, timingArray)),
        sum = Math.round(timingArray.reduce(function (a, b) {
            return a + b
        })),
        avg = Math.round(sum / timingArray.length),
        through = Number((numUsers / (sum * 1000 * 1000)).toString().match(/^\d+(?:\.\d{0,2})?/));

    console.log("\n\n\tTiming Results (milliseconds)\n");
    console.log("Min\tMax\tMean\tTotal Time\t  Throughput (Requests/Second)");
    console.log("---------------------------------------------------------------------");
    console.log(min + "  " + "   " + max + "     " + avg + "      " + sum + " \t\t\t  " + through + "\n\n")
}

function clear(done) {
    request.get('http://127.0.0.1:9000/bulk/clear?password=1234', function (res) {
        console.log("cleared");
        bulkUpload(done);
    });
}
