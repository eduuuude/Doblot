const CONSTANTS = require('./constants');
const events = require('./events');
var activeBridges = [];

exports.getIndexBridgeBySocket = function ( socket ) {	
	for (var i = 0; i < activeBridges.length ; i++) {
		if (activeBridges[i].human.socket == socket || activeBridges[i].doblot.socket == socket )
			return i;
	}
}

exports.getBridgeBySocket = function ( socket ) {
	var index = getIndexBridgeBySocket( socket );
	return activeBridges[index];
}

exports.createBridge = function ( human , doblot ) {
	activeBridges.push({
		human: human,
		doblot: doblot
	});

	human.socket.on(CONSTANTS.HUMAN_MESSAGE, function(data) {
    	events.echo( doblot.socket , CONSTANTS.HUMAN_MESSAGE, data );
	});

	doblot.socket.on(CONSTANTS.DOBLOT_MESSAGE, function(data) {
		events.echo( human.socket , CONSTANTS.DOBLOT_MESSAGE, data );
	});
}

exports.removeBridgeByIndex = function ( index ) {
	activeBridges.splice(index,1);
}

exports.removeBridgeBySocket = function ( socket ) {
	var bridge = getBridgeBySocket( socket );

	bridge.human.socket.removeAllListeners(CONSTANTS.HUMAN_MESSAGE, function(data) {
    	events.echo( doblot.socket , CONSTANTS.HUMAN_MESSAGE, data );
    });

    bridge.doblot.socket.removeAllListeners(CONSTANTS.DOBLOT_MESSAGE, function(data) {
		events.echo( human.socket , CONSTANTS.DOBLOT_MESSAGE, data );
    });

	var index = getIndexBridgeBySocket( socket );
	removeBridgeByIndex( index );
}