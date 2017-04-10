const CONSTANTS = require('./constants');

var connectedEntities = [];
//var connectedDoblots = [];

function getIndexBySocket( socket ) {
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) {
    if (connectedEntities[i].socket == socket) return i;
  }
}

function getOneBySocket( socket ) {
  var index = getIndexBySocket( socket );
  return connectedEntities[index];
}

function getOneByName( name ) {
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) {
    if (connectedEntities[i].name == value) return connectedEntities[i];
  }
}

exports.getOneStateBySocket = function ( socket ) {
	return getOneBySocket( socket ).state;
}

function removeBySocket ( socket ) {
	var index = getIndexBySocket(  socket );
    connectedEntities.splice(index, 1);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addDoblot = function ( socket ) {
	connectedEntities.push({
		socket: doblotSocket,
		name: '',
		propietary: '',
		state: CONSTANTS.STATE_WAITING_INFO
	});
}

exports.insertDoblotInfo = function ( socket, name, propietary ) {
	var doblot = getOneBySocket( socket );
    doblot.name = name;
    doblot.propietary = propietary;
    doblot.state = CONSTANTS.STATE_IDLE;
}

exports.removeDoblot = function ( socket ) {
	removeBySocket( socket );
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addHuman = function ( socket ) {
	connectedEntities.push( {
    socket: socket,
    name: '',
    state: CONSTANTS.STATE_WAITING_INFO
  });
}

exports.insertHumanInfo = function ( socket, name ) {
	var human = getOneBySocket( socket );
	human.name = name;
	human.state = CONSTANTS.STATE_IDLE;
}

exports.removeHuman = function ( socket ) {
	removeBySocket( socket );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

exports.sendMessage = function (socket, messageType, messageContentType, messageContent) {
	socket.emit(messageType, {
		type: messageContentType,
		content: messageContent
	});
}

exports.changeState = function (socket, state) {
	getOneBySocket( socket ).state = state;
}