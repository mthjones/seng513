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

db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    app.listen(config.port);
	
	clear()
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

function createNUsers(numUsers)
{
    function callback()
    {
        console.log("Done creating users");
        console.log(users);
    }
    var respond = _.after(numUsers, callback);
    
    for(var i = 0 ; i < numUsers;i++)
    {
        var newUsername = randomString(10);
        createUser(newUsername, '1234', respond);
    }
}

function logoutUser(user)
{
    var url = 'http://localhost:9000/logout';
    
    function callback(response)
    {
        console.log("Logged out user: " + user.username);   
        //loginUser(user);
    };
    
    request.post(url).send(user).end(callback);
}

function loginUser(user)
{
    var url = 'http://localhost:9000/sessions/create';
    
    function callback(response)
    {
        var setCookies = response.header['set-cookie']['0'].split(';').map(function(cookie) {
                    return cookie.split('=')
                }).reduce(function(obj, curr) {
                    obj[curr[0]] = curr[1];
                    return obj;
                }, {});
        user.sid = setCookies.sid;
        //console.log("User: " + user.username + " logged in with sid: " + user.sid);
    };
    
    request.post(url).send(user).end(callback);
}

function createUser(newUserName, newPassword, callbackF)
{
    var user = {name: newUserName, username: newUserName, password: newPassword, sid: 0};
    var url = 'http://localhost:9000/users/create';
    
    function callback(response)
    {
        var setCookies = response.header['set-cookie']['0'].split(';').map(function(cookie) {
                    return cookie.split('=')
                }).reduce(function(obj, curr) {
                    obj[curr[0]] = curr[1];
                    return obj;
                }, {});
        user.sid = setCookies.sid;
        users.push(user);
        
        callbackF();
        //console.log("User created");
        //logoutUser(user);
    };
    
    request.post(url).send(user).end(callback);
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

function clear(){
	request.get('http://127.0.0.1:9000/bulk/clear?password=1234', function(res){
		console.log("cleared");
        // createUser('rob', '123', function(){console.log("test call")});
        
        createNUsers(5);
        
        //console.log(users);
        //logoutUser(0);
        
        //createUser('sam', 'abc');
        //bulkUpload()
		
	});
}