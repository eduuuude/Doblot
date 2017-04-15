const events = require('./events');
const CONSTANTS = require('./public/constants.json');



var httpServerDoblot = require('http').createServer();
var ioDoblot = require('socket.io')(httpServerDoblot);



ioDoblot.on('connection', function(doblotSocket){
	//Cuando se conecta un doblot, se añade a la array de doblot conectados
	console.log('Doblot connected');

	events.doblotConnection( doblotSocket );

	//El controlMessageHandler es comun para humano y doblot
	doblotSocket.on(CONSTANTS.CONTROL_MESSAGE, function(data) {
		events.controlMessageHandler( doblotSocket , data );
	});

	doblotSocket.on('disconnect', function () {
		events.doblotDisconnection( doblotSocket );
	});
});
httpServerDoblot.listen(2000);


const configureHumanMongoose = require('./config/human.mongoose');
const configureHumanPassport = require('./config/human.passport');
const configureHumanExpress = require('./config/human.express');

const db = configureHumanMongoose();
const appServerHuman = configureHumanExpress();
const passport = configureHumanPassport();

var httpServerHuman = require('http').Server(appServerHuman);

var ioHuman = require('socket.io')(httpServerHuman);

/*
appServerHuman.get('/', function(req, res){
	res.sendfile('index.html');
});
*/
ioHuman.on('connection', function( humanSocket ){
	events.humanConnection( humanSocket );

	//El controlMessageHandler es comun para humano y doblot
	humanSocket.on( CONSTANTS.CONTROL_MESSAGE , function(data) {
		events.controlMessageHandler( humanSocket, data );
	});

	humanSocket.on('disconnect', function () {
		events.humanDisconnection( humanSocket );
	});
});

httpServerHuman.listen(3000, function() { console.log('Human server running')});

