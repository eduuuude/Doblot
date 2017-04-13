const CONSTANTS = require('./public/constants.json');
const events = require('./events');

var activeBridges = [];

function getIndexBridgeBySocket ( socket ) {	
	for (var i = 0; i < activeBridges.length ; i++) {
		if (activeBridges[i].human.socket == socket || activeBridges[i].doblot.socket == socket )
			return i;
	}
}

exports.getIndexBridgeBySocket = function ( socket ) { 
	return getIndexBridgeBySocket( socket );
}

function getBridgeBySocket ( socket ) {
	var index = getIndexBridgeBySocket( socket );
	return activeBridges[index];
}

exports.getBridgeBySocket = function ( socket ) {
	return getBridgeBySocket( socket );
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



function removeBridgeByIndex ( index ) {
	activeBridges.splice(index,1);
}

exports.removeBridgeByIndex = function ( index ) {
	removeBridgeByIndex ( index );
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