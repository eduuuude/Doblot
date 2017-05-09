const doblotDataPath = '/home/mean';

const path = require('path');
const doblotData = require(path.join(doblotDataPath, 'doblotData.json'));

//const commandLineArgs = require('command-line-args');
const request = require('request');

const socket = require('socket.io-client')(doblotData.server);

/*
var optionDefinitions = [
  { name: 'propietary', alias: 'p', type: String },
  { name: 'name', alias: 'n', type: String}
];

var options = commandLineArgs(optionDefinitions);
*/

console.log('Starting doblot. Name: ' + doblotData.username + ' Propietary: ' + doblotData.propietary);


//Conexión con el servidor

var testStarter = false;

var CONSTANTS;

var sendMessage = function (socket, messageType, messageContentType, messageContent) {
	socket.emit(messageType, {
		type: messageContentType,
		content: messageContent
	});
}

socket.on('CONSTANTS', function ( data ) {
	CONSTANTS = data.content;
	console.log('Constants received');

	/*
	sendMessage(socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_INFO, {
		name: options.name,
		propietary: options.propietary
	});
	*/

	var httpOptions = {
    url: doblotData.server + '/signin',
    method: 'POST',
    headers: { 'User-Agent' : 'Super Agent/0.0.1' , 'Content-Type' : 'application/json' },
    form: {'username': doblotData.username, 'password': doblotData.password, 'socketId': socket.id }
};

	request(httpOptions, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        // Print out the response body
	        console.log(body)
	    }
	})

	socket.on(CONSTANTS.HUMAN_MESSAGE, function(data) {
		switch ( data.type ) {
			case ( CONSTANTS.CONNECTION_TEST_REQUEST ): {
				if (testStarter) {
					//Responder al servidor que el test es correcto
					sendMessage( socket , CONSTANTS.CONTROL_MESSAGE, CONSTANTS.CONNECTION_TEST_OK, undefined);
					testStarter = false;
				}
				else {
					//Responder al doblot con el mismo mensaje
					sendMessage ( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
				}

				break;
			}
			case ( CONSTANTS.VIDEO_STREAM_REQUEST ): {
				webcam_server.startBroadcast();

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
				sendMessage(socket, CONSTANTS.CONTROL_MESSAGE, CONSTANTS.DOBLOT_INFO, {
					name: doblotData.username,
					propietary: doblotData.propietary
				});

				break;
			}
			case ( CONSTANTS.ALERT): {
				console.log(data.content);

				break;
			}
			case ( CONSTANTS.CONNECTION_TEST_REQUEST ): {
				//Responder al doblot con el mismo mensaje
				sendMessage ( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
				testStarter = true;

				break;
			}
			case(CONSTANTS.CONNECTION_ESTABLISHED): {
				

				break;
			}
			case(CONSTANTS.CONNECTION_RELEASE): {
				webcam_server.stopBroadcast();

				break;
			}
		}
	});
});



const LiveCam = require('./livecam_mod');


const webcam_server = new LiveCam
({
 
    // address and port of GStreamer's tcp sink
    'gst_tcp_addr' : '127.0.0.1',
    'gst_tcp_port' : 10000,
    
    // callback function called when server starts
    'start' : function() {
        console.log('WebCam server started!');
    },

    'imageEmitCallback' : function(data) {
      sendMessage(socket, CONSTANTS.DOBLOT_MESSAGE, CONSTANTS.IMAGE, data);
    },
    
    // webcam object holds configuration of webcam frames
    'webcam' : {
        
        // should frames be converted to grayscale (default : false)
        'grayscale' : doblotData.webcamGrayscale,
        
        // should width of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'width' : doblotData.webcamWidth,
 
        // should height of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'height' : doblotData.webcamHeight,
        
        // framerate of the feed (default : 0)
        // provide 0 to match webcam input
        'framerate' : doblotData.webcamFramerate
    }
});







