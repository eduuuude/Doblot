const CONSTANTS = require('./public/constants.json');
const connections = require('./connections');
const bridges = require('./bridges');

exports.humanConnection = function ( socket ) {
	connections.addHuman( socket );
	connections.sendMessage(socket , 'CONSTANTS' , '' , CONSTANTS);
}

exports.humanDisconnection = function ( socket ) {
	if (connections.getOneStateBySocket(socket) == CONSTANTS.STATE_CONNECTED) {
		var bridge = bridges.getBridgeBySocket( socket );

		connections.sendMessage( bridge.doblot.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );

		bridge.doblot.state = CONSTANTS.STATE_IDLE;

		bridges.removeBridgeBySocket( socket );
	}

	connections.removeHuman( socket );
}

exports.doblotConnection = function ( socket ) {
	connections.addDoblot( socket );
	connections.sendMessage(socket , 'CONSTANTS' , '' , CONSTANTS);
}

exports.doblotDisconnection = function ( socket ) {
	if (connections.getOneStateBySocket(socket) == CONSTANTS.STATE_CONNECTED) {
		connections.removeDoblot( socket );

		var bridge = bridges.getBridgeBySocket( socket );

		connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );
		connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_LIST, connections.getHumanDoblots( bridge.human.name ));

		bridge.human.state = CONSTANTS.STATE_IDLE;

		bridges.removeBridgeBySocket( socket );
	}
	else {
		var propietaryName = connections.getOneBySocket(socket).propietary;
		var propietary = connections.getOneByName(propietaryName);

		connections.removeDoblot( socket );

		if (propietary) {
			connections.sendMessage( propietary.socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_LIST, connections.getHumanDoblots( propietary.name ));
		}
	}

	
}

//Funcion para el puente
exports.echo = function (socket, messageType ,data) {
	socket.emit(messageType, data);
}

exports.controlMessageHandler = function (socket, data) {
	console.log('Control message: ' + data.type + ' | ' + data.content);
	if (connections.checkAuth(socket)) {
		switch (data.type) {
			case(CONSTANTS.HUMAN_INFO): {
				connections.insertHumanInfo(socket, data.content.name);
				//console.log(connections.getHumanDoblots(data.content.name));
				connections.sendMessage(socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_LIST, connections.getHumanDoblots(data.content.name));

				break;
			}
			case(CONSTANTS.DOBLOT_INFO): {
				connections.insertDoblotInfo(socket, data.content.name, data.content.propietary);

				let human = connections.getOneByName( data.content.propietary );

				if (human != undefined && human.state != CONSTANTS.STATE_CONNECTED) {
					connections.sendMessage(human.socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_LIST, connections.getHumanDoblots(human.name));
				}

				break;
			}
			case(CONSTANTS.DOBLOT_SELECTED): {
				var human = connections.getOneBySocket( socket );
				var doblot = connections.getOneByName ( data.content );

				bridges.createBridge(human, doblot);

	  			human.state = CONSTANTS.STATE_TESTING_CONNECTION;
				doblot.state = CONSTANTS.STATE_TESTING_CONNECTION;

				connections.sendMessage(human.socket, CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST, undefined );

				break;
			}
			case(CONSTANTS.CONNECTION_TEST_OK): {
				var bridge = bridges.getBridgeBySocket( socket );

				bridge.human.state = CONSTANTS.STATE_CONNECTED;
	    		bridge.doblot.state = CONSTANTS.STATE_CONNECTED;

	    		connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_ESTABLISHED, undefined );
	    		connections.sendMessage( bridge.doblot.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_ESTABLISHED, undefined );

				break;
			}
			case(CONSTANTS.CONNECTION_RELEASE_REQUEST): {
				var bridge = bridges.getBridgeBySocket( socket );

				connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );
				connections.sendMessage( bridge.doblot.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );

				connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_LIST, connections.getHumanDoblots( bridge.human.name ));

				bridge.human.state = CONSTANTS.STATE_IDLE;
				bridge.doblot.state = CONSTANTS.STATE_IDLE;

				bridges.removeBridgeBySocket( socket );

				break;
			}			
		}
	}
}