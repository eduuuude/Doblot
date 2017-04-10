const events = require('./events');

var ioDoblot = require('socket.io')();

ioDoblot.on('connection', function(doblotSocket){
	//Cuando se conecta un doblot, se añade a la array de doblot conectados
	console.log('Doblot connected');

	events.doblotConnection( doblotSocket )

	//El controlMessageHandler es comun para humano y doblot
	doblotSocket.on('controlMessage', function(data) {
		events.controlMessageHandler( doblotSocket , data );
	});

	doblotSocket.on('disconnect', function () {
		events.doblotDisconnection( doblotSocket );
	});
});
ioDoblot.listen(2000);


var appServerHuman = require('express')();
var httpServerHuman = require('http').Server(appServerHuman);

var ioHuman = require('socket.io')(httpServerHuman);

appServerHuman.get('/', function(req, res){
	res.sendfile('index.html');
});

ioHuman.on('connection', function( humanSocket ){
	console.log('Human connected');
	events.humanConnection( humanSocket );

	//El controlMessageHandler es comun para humano y doblot
	humanSocket.on('controlMessage', function(data) {
		events.controlMessageHandler( humanSocket, data );
	});

	humanSocket.on('disconnect', function () {
	events.humanDisconnection( humanSocket );
	});
});

httpServerHuman.listen(3000, function(){
console.log('listening on *:3000');
