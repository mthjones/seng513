var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db'),
	request = require('superagent'),
    _ =  require('lodash');

var app = express();

require('./config/passport');
require('./config/express')(app);
require('./config/routes')(app);

var users = [];
var userAgents = [];
var timingArray = new Array();
var server;

db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    server = app.listen(config.port);

    var done = function() {
        server.close();
    };
	
    testMultipleUserUploadPhoto(100, done);
    // testUserUploadPhoto(done);
});

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
    	var randomPoz = Math.floor(Math.random() * charSet.length);
    	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function createNUsers(numUsers, callback)
{
    var respond = _.after(numUsers, callback);
    
    for(var i = 0 ; i < numUsers;i++)
    {
        var newUsername = randomString(10);
        createUser(newUsername, '1234', respond);
    }
}

function createUser(newUserName, newPassword, callbackFunction)
{
    var user = {name: newUserName, username: newUserName, password: newPassword};
    var url = 'http://localhost:9000/users/create';
    var userAgent = request.agent();
    function callback(response)
    {
        userAgents.push(userAgent);
        callbackFunction();
    };
    
    userAgent.post(url).send(user).end(callback);
}

function bulkUpload(){
	function callback(res){
		console.log("uploaded")
	}
	
	var txt = '{ "employees" : [' +
	'{ "firstName":"John" , "lastName":"Doe" },' +
	'{ "firstName":"Anna" , "lastName":"Smith" },' +
	'{ "firstName":"Peter" , "lastName":"Jones" } ]}';
	
	var bulkData = '[{"id": 1, "name":"jill", "follows":[3,4,5], "password": "abcdef"},' +
	    '{"id": 2, "name":"bill", "follows":[1,3,5], "password": "abcdef"},' +
	    '{"id": 3, "name":"james", "follows":[4,5], "password": "abcdef"},' +
	    '{"id": 4, "name":"john", "follows":[1], "password": "abcdef"},' +
	    '{"id": 5, "name":"luke", "follows":[], "password": "abcdef"}]'
	
	request.post('http://127.0.0.1:9000/bulk/users?password=1234')
		.set('Content-Type', 'application/json')
		.send(bulkData)
		.end(callback)
}

function uploadPhotoFromUser(userAgent, done)
{
    var url = 'http://localhost:9000/photos/create';
    
    //var startTime = process.hrtime()[1];
    var startD = new Date();
    function callback(err, response)
    {
        var endD = new Date();
        var timeTaken = endD - startD;
        //var timeTaken = (process.hrtime()[1] - startTime)/1000000;
        timingArray.push(timeTaken);
        done();
    };
   
    userAgent.post(url).attach('photo', 'images/test2.png').send().end(callback);
}

function testMultipleUserUploadPhoto(numUsers, done)
{
    createNUsers(numUsers, function()
    {
        var callback = _.after(numUsers, function()
        {
            console.log("Done uploading all photos");
            output(numUsers);
            done();
        });
            
            
        for(var i = 0 ; i < numUsers; i++)
        {
            uploadPhotoFromUser(userAgents[i], callback);
        }
    });
}

function output(numUsers)
{
    console.log(timingArray);
    var min = Math.round(Math.min.apply(null, timingArray)),
	    max = Math.round(Math.max.apply(null, timingArray)),
	 	sum = Math.round(timingArray.reduce(function(a, b) { return a + b })),
		avg = Math.round(sum / timingArray.length),
		through = Number((numUsers/(sum * 1000 * 1000)).toString().match(/^\d+(?:\.\d{0,2})?/));
		
	console.log("\n\n\tTiming Results (milliseconds)\n")
	console.log("Min\tMax\tMean\tTotal Time\t  Throughput (Requests/Second)")
	console.log("---------------------------------------------------------------------")
	console.log(min+"  "+"   "+max+"     "+avg+"      "+sum+" \t\t\t  "+through+"\n\n")
}

function clear(){
	request.get('http://127.0.0.1:9000/bulk/clear?password=1234', function(res){
		console.log("cleared");
	});
}
