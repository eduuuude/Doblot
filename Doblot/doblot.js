const doblotDataPath = '/home/pi/Doblot/Doblot';

const path = require('path');
const doblotData = require(path.join(doblotDataPath, 'doblotData.json'));

const request = require('request');

const socket = require('socket.io-client')(doblotData.server);

var pn532 = require('pn532');
var SerialPort = require('serialport');

var Gpio = require('pigpio').Gpio;
var rh = new Gpio(17,{mode: Gpio.OUTPUT});
var ra = new Gpio(18,{mode: Gpio.OUTPUT});
var lh = new Gpio(27,{mode: Gpio.OUTPUT});
var la = new Gpio(22,{mode: Gpio.OUTPUT});


var serialPort = new SerialPort('/dev/ttyAMA0', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort);

rfid.on('ready', function() {
    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
    	if (tag.uid == doblotData.nfcMaintenanceTagUID)
        	console.log(Date.now() + " Maintenance Tag: Opening.");
        if (tag.uid == doblotData.nfcDeactivateTagUID) {
        	console.log(Date.now() + " Deactivate Tag: Exiting.");
        	process.exit();
        }
    });
});

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

var move = function(rhpos, rapos, lhpos, lapos) {
	rh.servoWrite(1500+Math.floor(rhpos*5.56));
	ra.servoWrite(1500+Math.floor(rapos*5.56));
	lh.servoWrite(1500+Math.floor(lhpos*5.56));
	la.servoWrite(1500+Math.floor(lapos*5.56));
}

socket.on('CONSTANTS', function ( data ) {
	CONSTANTS = data.content;
	console.log('Constants received');

	var httpOptions = {
	    url: 'http://192.168.0.70:2000/signin',
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
			case (CONSTANTS.MOVEMENT): {
				switch(data.content){
					case ("ArrowUp"):
<<<<<<< HEAD
                        console.log(data.content + ' pressed');
						//motor.servoWrite(1500);
						sendMessage(socket,CONSTANTS.DOBLOT_MESSAGE,CONSTANTS.TEXT, "El doblot se ha movido hacia adelante");
					break;
					case ("ArrowDown"):
                        console.log(data.content + ' pressed');
						//motor.servoWrite(1000);
						sendMessage(socket,CONSTANTS.DOBLOT_MESSAGE,CONSTANTS.TEXT, "El doblot se ha movido hacia atras");
					break;
					case ("ArrowLeft"):
                        console.log(data.content + ' pressed');
						//motor.servoWrite(2000);
						sendMessage(socket,CONSTANTS.DOBLOT_MESSAGE,CONSTANTS.TEXT, "El doblot se ha movido hacia la izquierda");
					break;
					case ("ArrowRight"):
                		console.log(data.content + ' pressed');
						//motor.servoWrite(1700);
						sendMessage(socket,CONSTANTS.DOBLOT_MESSAGE,CONSTANTS.TEXT, "El doblot se ha movido hacia la derecha");
=======
               			console.log(data.content + ' pressed');
						move(0,-40,0,-20);
						setTimeout(function() {
							move(30,-40,30,-20);
							setTimeout(function() {
								move(30,-40,30,-20);
								setTimeout(function() {
									move(0,20,0,40);
									setTimeout(function() {
										move(-30,20,-30,40);
										setTimeout(function() {
											move(-30,0,-30,0);
										}, 100);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
						sendMessage( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
					break;
					case ("ArrowDown"):
               			console.log(data.content + ' pressed');
											move(-30,0,-30,0);
						setTimeout(function() {
										move(-30,20,-30,40);
							setTimeout(function() {
									move(0,20,0,40);
								setTimeout(function() {
								move(30,-40,30,-20);
									setTimeout(function() {
							move(30,-40,30,-20);
										setTimeout(function() {
						move(0,-40,0,-20);
										}, 100);
									}, 100);
								}, 100);
							}, 100);
						}, 100);
						sendMessage( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
					break;
					case ("ArrowLeft"):
               			console.log(data.content + ' pressed');
						move(-40,0,-20,0);
						setTimeout(function() {
							move(-40,30,-20,30);
							setTimeout(function() {
								move(0,30,0,30);
								setTimeout(function() {
									move(30,0,30,0);
									setTimeout(function() {
										move(0,0,0,0);
										
									}, 100);
								}, 100);
							}, 100);
						}, 100);
						sendMessage( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
					break;
					case ("ArrowRight"):
		            	console.log(data.content + ' pressed');
										move(0,0,0,0);
						setTimeout(function() {
									move(30,0,30,0);
							setTimeout(function() {
								move(0,30,0,30);
								setTimeout(function() {
							move(-40,30,-20,30);
									setTimeout(function() {
						move(-40,0,-20,0);
										
									}, 100);
								}, 100);
							}, 100);
						}, 100);
						sendMessage( socket , CONSTANTS.DOBLOT_MESSAGE , CONSTANTS.CONNECTION_TEST_REQUEST , undefined);
					break;                       
				}
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






