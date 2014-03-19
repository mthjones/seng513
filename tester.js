var express = require('express'),
    config = require('./config/config'),
    db = require('./config/db')
	request = require('superagent');

var app = express();

require('./config/passport');
require('./config/express')(app);
require('./config/routes')(app);

db.sequelize.sync({force: config.envname === "development"}).complete(function(err) {
    if (err) throw err;
    app.listen(config.port);
	
	clear()
	//bulkUpload()
});

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
		bulkUpload()
		console.log("cleared")
	});
}