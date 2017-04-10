const connections = require('./connections');
const CONSTANTS = require('./constants');
const bridges = require('./bridges');

exports.humanConnection = function ( socket ) {
	connections.addHuman( socket );
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
}

export.doblotDisconnection = function ( socket ) {
	if (connections.getOneStateBySocket(socket) == CONSTANTS.STATE_CONNECTED) {
		var bridge = bridges.getBridgeBySocket( socket );

		connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );

		bridge.doblot.state = CONSTANTS.STATE_IDLE;

		bridges.removeBridgeBySocket( socket );
	}

	connections.removeDoblot( socket );
}

//Funcion para el puente
exports.echo = function (socket, messageType ,data) {
	socket.emit(messageType, data);
}

function controlMessageHandler(socket, data) {
	switch (data.type) {
		case(CONSTANTS.HUMAN_INFO): {
			insertHumanInfo(socket, data.content.name);

			break;
		}
		case(CONSTANTS.DOBLOT_INFO): {
			insertDoblotInfo(socket, data.content.name, data.content.propietary);

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
			var bridge = getConnectionBySocket(activeConnections, socket);

			bridge.human.state = CONSTANTS.STATE_CONNECTED;
    		bridge.doblot.state = CONSTANTS.STATE_CONNECTED;

    		connections.sendMessage( bridge.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_ESTABLISHED, undefined );
    		connections.sendMessage( bridge.doblot.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_ESTABLISHED, undefined );

			break;
		}
		case(CONSTANTS.CONNECTION_RELEASE_REQUEST): {
			var connection = getBridgeBySocket( socket );

			connections.sendMessage( connection.human.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );
			connections.sendMessage( connection.doblot.socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE, undefined );

			connection.human.state = CONSTANTS.STATE_IDLE;
			connection.doblot.state = CONSTANTS.STATE_IDLE;

			bridges.removeBridgeBySocket( socket );

			break;
		}			
	}
}