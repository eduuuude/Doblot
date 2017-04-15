var doblotListDiv = document.getElementById('doblotList');
var doblotListPanelDiv = document.getElementById('doblotListPanel');

var doblotMessagesDiv = document.getElementById('doblotMessages');

var verificacionForm = document.getElementById('verificacionForm');

var humanInfoDiv = document.getElementById('humanInfo');

var humanName = document.getElementById('humanName');
var humanPassword = document.getElementById('humanPassword');

var releaseButton = document.getElementById('releaseButton');

var humanMessage = document.getElementById('humanMessageBox');

var video = document.getElementById('video');



var testStarter = false;

var socket = io();

var CONSTANTS;

const sendMessage = function (socket, messageType, messageContentType, messageContent) {
	socket.emit(messageType, {
		type: messageContentType,
		content: messageContent
	});
}

socket.on('CONSTANTS', function(data) {
	CONSTANTS = data.content;
	socket.on(CONSTANTS.DOBLOT_MESSAGE, function(data) {
		switch ( data.type ) {
			case ( CONSTANTS.CONNECTION_TEST_REQUEST ): {
				if (testStarter) {
					//Responder al servidor que el test es correcto
					sendMessage( socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.CONNECTION_TEST_OK, undefined);
					testStarter = false;
				}
				else {
					//Responder al doblot con el mismo mensaje
					sendMessage ( socket , CONSTANTS.HUMAN_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
				}

				break;
			}
			case ( CONSTANTS.IMAGE ): {
				video.src = 'data:image/jpeg;base64,' + data.content;

				break;
			}

			case ( CONSTANTS.TEXT ): {
				doblotMessagesDiv.innerHTML = doblotMessagesDiv.innerHTML + '</br>' + data;

				break;
			}
		}
	});

	socket.on(CONSTANTS.CONTROL_MESSAGE, function(data) {
		switch (data.type) {
			case ( CONSTANTS.INFO_REQUEST): {
				sendMessage( socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.HUMAN_INFO , { name: humanName.value });

				break;
			}
			case ( CONSTANTS.CONNECTION_TEST_REQUEST ): {
				//Responder al doblot con el mismo mensaje
				sendMessage ( socket , CONSTANTS.HUMAN_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
				testStarter = true;

				break;
			}
			case( CONSTANTS.DOBLOT_LIST ): {
				var range = document.createRange(); 
				range.selectNodeContents(doblotListDiv); 
				range.deleteContents(); 

				doblotListPanelDiv.style.display = "inline-block";
				humanInfoDiv.style.display = "none";
				doblotMessagesDiv.style.display = "none";
				//Cada nombre se introduce en una etiqueta <p></p>, se le asigna un listener que envia el nombre al servidor
				//y se añade al div de la lista.
				for (var i=0; i<data.content.length ; i++) {
					var doblotListElement = document.createElement("p");
					doblotListElement.innerHTML = data.content[i];

					doblotListElement.onclick = function() { sendMessage(socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_SELECTED, doblotListElement.innerHTML) }				

					doblotListDiv.appendChild(doblotListElement);
				}

				break;
			}
			case( CONSTANTS.CONNECTION_ESTABLISHED ): {
				sendMessage(socket, CONSTANTS.HUMAN_MESSAGE, CONSTANTS.VIDEO_STREAM_REQUEST, undefined);

				doblotListPanelDiv.style.display = "none";
				doblotMessagesDiv.style.display = "inline-block";

				break; 
			}
			case( CONSTANTS.CONNECTION_RELEASE ): {
				setTimeout(function() {
					video.src = "http://www.fotogramas.es/var/ezflow_site/storage/images/noticias-cine/annabelle-2-primera-imagen-trailer/115138377-1-esl-ES/Annabelle-2-Primera-imagen-y-anuncio-del-trailer_landscape.jpg";
				}, 100);
				
				break;
			}		
		}
	});

	releaseButton.onclick = function() {
		sendMessage( socket , CONSTANTS.CONTROL_MESSAGE , CONSTANTS.CONNECTION_RELEASE_REQUEST , undefined);

		setTimeout(function() {
			video.src="http://www.fotogramas.es/var/ezflow_site/storage/images/noticias-cine/annabelle-2-primera-imagen-trailer/115138377-1-esl-ES/Annabelle-2-Primera-imagen-y-anuncio-del-trailer_landscape.jpg";
		}, 100);
	}

	verificationForm.onsubmit = function () {
	    $.post("/signin", {
	        username: humanName.value,
	        password: humanPassword.value,
	        socketId: socket.id
	    });
	    return false;
	}
});



/////////////////////////////////////////////////////

