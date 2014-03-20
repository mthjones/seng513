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


db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    app.listen(config.port);
	
	//clear();
    testUserUploadPhoto();
    // testCreateNUsers(5);
	//bulkUpload()
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
        var testUrl = 'http://localhost:9000/feed';
        userAgent.get(testUrl).end(function()
        {
            console.log("feed requested");
            //console.log("retrieved user" + userAgent.username + "feed");
        });
        callbackFunction();
        
        // var setCookies = response.header['set-cookie']['0'].split(';').map(function(cookie) {
                    // return cookie.split('=')
                // }).reduce(function(obj, curr) {
                    // obj[curr[0]] = curr[1];
                    // return obj;
                // }, {});
        // user.sid = setCookies.sid;
        // users.push(user);
        // if callbackFunction
            // callbackFunction();
        //console.log("User created");
        //logoutUser(user);
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

function testCreateNUsers(numberOfUsers)
{
    createNUsers(numberOfUsers, function callback()
    {
        console.log("Done creating users");
    });
}

function uploadPhotoFromUser(userAgent)
{
    var url = 'http://localhost:9000/photos/create';
    
    function callback(response)
    {
        console.log("\n\nuploaded a photo\n\n");
    };
    function handle(error)
    {   
        console.log("\n\nYO\n\n");
        console.log(error);
    }
    userAgent.post(url).attach('testname', 'images/test2.png').on('error', handle).end(callback);
}

function testUserUploadPhoto()
{
    createUser('rob', '123', function()
    {
        uploadPhotoFromUser(userAgents[0]);
    });
}

function clear(){
	request.get('http://127.0.0.1:9000/bulk/clear?password=1234', function(res){
		console.log("cleared");
        // createUser('rob', '123', function(){console.log("test call")});

        //console.log(users);
        //logoutUser(0);
        
        //createUser('sam', 'abc');
        //bulkUpload()
		
	});
}