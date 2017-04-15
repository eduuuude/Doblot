const CONSTANTS = require('./public/constants.json');

var connectedEntities = [];
//var connectedDoblots = [];


function getIndexBySocket( socket ) {
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) {
    if (connectedEntities[i].socket == socket) return i;
  }
}

function getOneBySocket ( socket ) {
  var index = getIndexBySocket( socket );
  return connectedEntities[index];
}

function getIndexBySocketId( socketId ) {
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) {
    if (connectedEntities[i].socket.id == socketId) return i;
  }
}

function getOneBySocketId ( socketId ) {
  var index = getIndexBySocketId( socketId );
  return connectedEntities[index];
}

function getOneByName ( name ) {
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) {
    if (connectedEntities[i].name == name) return connectedEntities[i];
  }
}

function removeBySocket ( socket ) {
	var index = getIndexBySocket(  socket );
    connectedEntities.splice(index, 1);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.getOneBySocket = function (socket) {
	return getOneBySocket(socket);
}

exports.getOneByName = function (name) {
	return getOneByName(name);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addDoblot = function ( socket ) {
	connectedEntities.push({
		socket: socket,
		auth: false,
		name: '',
		propietary: '',
		state: CONSTANTS.STATE_WAITING_INFO
	});
	console.log('New doblot connection | No of entity connections: ' + connectedEntities.length);
}

exports.insertDoblotInfo = function ( socket, name, propietary ) {
	var doblot = getOneBySocket( socket );
    doblot.name = name;
    doblot.propietary = propietary;
    doblot.state = CONSTANTS.STATE_IDLE;
    console.log('Doblot information inserted | Name: ' + doblot.name + '. Propietary: ' + doblot.propietary);
}

exports.removeDoblot = function ( socket ) {
	removeBySocket( socket );
	console.log('Doblot disconnection | No of entity connections: ' + connectedEntities.length);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.addHuman = function ( socket ) {
	connectedEntities.push( {
		socket: socket,
		auth: false,
		name: '',
		state: CONSTANTS.STATE_WAITING_INFO
	});
	console.log('New human connection | No of entity connections: ' + connectedEntities.length);
}

exports.insertHumanInfo = function ( socket, name ) {
	var human = getOneBySocket( socket );
	human.name = name;
	human.state = CONSTANTS.STATE_IDLE;
	console.log('Human information inserted | Name: ' + human.name );
}

exports.removeHuman = function ( socket ) {
	removeBySocket( socket );
	console.log('Human disconnection | No of entity connections: ' + connectedEntities.length);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////

function sendMessage (socket, messageType, messageContentType, messageContent) {
	socket.emit(messageType, {
		type: messageContentType,
		content: messageContent
	});
}

exports.sendMessage = function (socket, messageType, messageContentType, messageContent) {
	sendMessage(socket, messageType, messageContentType, messageContent);
}

exports.changeState = function (socket, state) {
	getOneBySocket( socket ).state = state;
}

exports.getOneStateBySocket = function ( socket ) {
	return getOneBySocket( socket ).state;
}

exports.getHumanDoblots = function ( value ) { 
  var resultArray = []; 
  for (var i=0, iLen=connectedEntities.length; i<iLen; i++) { 
    if (connectedEntities[i].propietary === value) { 
      //console.log(connectedDoblots[i].name); 
      resultArray.push(connectedEntities[i].name); 
    } 
  } 
  return resultArray; 
}

exports.authenticateEntity = function ( socketId ) {
	var entity = getOneBySocketId( socketId );
	if (!entity.auth) {
		sendMessage(entity.socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.INFO_REQUEST, undefined);
		entity.auth = true;
	}
}
	
exports.checkAuth = function ( socket ) {
	return getOneBySocket( socket ).auth;
}