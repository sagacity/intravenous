var http = require('http');
var path = require('path');

var express = require('express');
var router = express();
var server = http.createServer(router);

var intravenous = require('intravenous');
var civilized = require('./civilizedGreeter.js');
var pirate = require('./pirateGreeter.js');
var manager = require('./greetingManager.js');

var container = intravenous.create();
container.register("manager", manager);

router.use(express.static(path.resolve(__dirname, 'client')));

router.get("/hello", function(req, res){
	var name = req.query.name;
	container.register("greeter", civilized);
	var gm = container.get("manager");
	res.send(gm.salute.call(gm, name));
});

router.get("/arrr", function(req, res){
	
	var name = req.query.name;
	container.register("greeter", pirate);
	var gm = container.get("manager");
	res.send(gm.salute(name));
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0");