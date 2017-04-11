var doblotListDiv = document.getElementById('doblotList');

var doblotMessagesDiv = document.getElementById('doblotMessages');

var humanInfoDiv = document.getElementById('humanInfo');
var sendNameButton = document.getElementById('sendNameButton');
var humanNameBox = document.getElementById('humanNameBox');

var releaseButton = document.getElementById('releaseButton');

var humanMessage = document.getElementById('humanMessageBox');

var testStarter = false;

var video = document.getElementById('video');

var socket = io();

var sendMessage = function (socket, messageType, messageContentType, messageContent) {
	socket.emit(messageType, {
		type: messageContentType,
		content: messageContent
	});

socket.on(CONSTANTS.DOBLOT_MESSAGE, function(data) {
	if (data.type == CONSTANTS.CONNECTION_TEST_REQUEST) {
		if (testStarter) {
			//Responder al servidor que el test es correcto
			sendMessage( socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.CONNECTION_TEST_OK, undefined);
			testStarter = false;
		}
		else {
			//Responder al doblot con el mismo mensaje
			sendMessage ( socket , CONSTANTS.HUMAN_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
		}
		else if (data.type == 'image') {
		video.src = 'data:image/jpeg;base64,' + data.content;
		}
		else {
		doblotMessages.innerHTML = doblotMessages.innerHTML + '</br>' + data;
	}
});

socket.on(CONSTANTS.CONTROL_MESSAGE, function(data) {
	switch (data.type) {
		case(CONSTANTS.DOBLOT_LIST): {
			doblotListDiv.style.display = "inline-block";
			humanInfoDiv.style.display = "none";
			doblotMessagesDiv.style.display = "none";
			//Cada nombre se introduce en una etiqueta <p></p>, se le asigna un listener que envia el nombre al servidor
			//y se añade al div de la lista.
			for (var i=0; i<data.length ; i++) {
				var doblotListElement = document.createElement("p");
				doblotListElement.innerHTML = data[i];

				doblotListElement.onclick = function() { sendMessage(socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_SELECTED, doblotListElement.innerHTML) }				

				doblotListDiv.appendChild(doblotListElement);
			}

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

if (data.type == 'connectionTest') {
testStarter = true;
socket.emit('humanMessage', {
type: 'connectionTest',
content: ''
});
}
else if (data.type == 'connectionEstablished') {
//comenzar a enviar datos o poner listener para teclas o algo asi.
socket.emit("humanMessage", {
type: 'videoStreamRequest',
content: ''
});

doblotListDiv.style.display = "none";
doblotMessagesDiv.style.display = "inline-block";
}
else {
console.log('Server message: ' + data.type + ' | ' + data.content);
}
});

socket.on('image', function (data) {
video.src = "data:image/jpeg;base64," + data;
});

socket.on('doblotDisconnected', function(data) {
//parar de enviar datos y algun alert para avisar de que se ha desconectado
});


/////////////////////////////////////////////////////

sendNameButton.onclick = function() {
socket.emit('humanInfo', {
name: humanNameBox.value
});
};

releaseButton.onclick = function() {
socket.emit('releaseConnection', {});
setTimeout(function() {
video.src="http://www.fotogramas.es/var/ezflow_site/storage/images/noticias-cine/annabelle-2-primera-imagen-trailer/115138377-1-esl-ES/Annabelle-2-Primera-imagen-y-anuncio-del-trailer_landscape.jpg";
}, 100);

}