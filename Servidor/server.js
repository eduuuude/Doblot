const events = require('./events');
const CONSTANTS = require('./public/constants.json');



const configureMongoose = require('./config/mongoose');
const db = configureMongoose();



const configurePassport = require('./config/passport');

const configureDoblotExpress = require('./config/doblot.express');
const configureHumanExpress = require('./config/human.express');

const appServerHuman = configureHumanExpress();
const appServerDoblot = configureDoblotExpress();

const passport = configurePassport();

var httpServerDoblot = require('http').Server(appServerDoblot);
var ioDoblot = require('socket.io')(httpServerDoblot);


ioDoblot.on('connection', function(doblotSocket){
	events.doblotConnection( doblotSocket );

	//El controlMessageHandler es comun para humano y doblot
	doblotSocket.on(CONSTANTS.CONTROL_MESSAGE, function(data) {
		events.controlMessageHandler( doblotSocket , data );
	});

	doblotSocket.on('disconnect', function () {
		events.doblotDisconnection( doblotSocket );
	});
});




const httpServerHuman = require('http').Server(appServerHuman);

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


httpServerDoblot.listen(2000, function() { console.log('Doblot server running')});
httpServerHuman.listen(3000, function() { console.log('Human server running')});

