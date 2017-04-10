/*
Código de un Doblot
*/




//Libreria de prseo de argumentos de linea de comandos
var commandLineArgs = require('command-line-args');

var optionDefinitions = [
  { name: 'propietary', alias: 'p', type: String },
  { name: 'name', alias: 'n', type: String}
];

var options = commandLineArgs(optionDefinitions);

var timer;

console.log('Starting doblot. Name: ' + options.name + ' Propietary: ' + options.propietary);


//Funcion de numeros random, actualmente utilizada para generar nombres de doblots diferentes.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

//Conexión con el servidor
var socket = require('socket.io-client')('http://localhost:2000');

var testStarter = false;

//Subscricion de eventos
socket.on('connect', function(){});
  socket.emit('doblotInfo', {
     name: options.name,
     propietary: options.propietary
  }
);

socket.on('event', function(data){});

socket.on('disconnect', function(){});

//Este evento debería darse cuando la conexión esta estableciendose o establecida. Son mensajes del humano
socket.on('humanMessage', function(data) {
  //Si el mensaje recibido es para testear la conexión
  if (data.type == 'connectionTest') {
    if (testStarter) {
      //Responder al servidor que OK
      socket.emit('controlMessage', {
        type: 'connectionOK',
        content: ''
      });
      testStarter = false;
    }
    
    
    else {
      //Responder al humano con el mismo mensaje
      socket.emit('doblotMessage', {
        type: 'connectionTest',
        content: ''
      });
    }
  }
  //Peticion del humano para iniciar streaming
  else if (data.type == 'videoStreamRequest') {
      webcam_server.startBroadcast();
    }
  else {
    console.log(data.type + ': ' + data.content);
  }
});

socket.on('controlMessage', function(data) {
  if (data.type == 'connectionTest') {
    testStarter = true;
    socket.emit('doblotMessage', {
      type: 'connectionTest',
      content: ''
    });
  }
  else if (data.type == 'connectionEstablished') {
    //comenzar a enviar datos o poner listener para teclas o algo asi.
    /*
    timer = setInterval( function() {
        socket.emit('doblotMessage', {
          type: 'message',
          content: options.name
        });
      },1000);
    */
  }
  else {
    console.log('Server message: ' + data.type + ' | ' + data.content);
  }
});

//Notificacion desde el servidor de que el humano se ha desconectado
socket.on('humanDisconnected', function(data) {
  console.log("asojdoiasjd");
  webcam_server.stopBroadcast();
});

const LiveCam = require('livecam');


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
      socket.emit('doblotMessage', {
        type: 'image',
        content : data
      });
    },
    
    // webcam object holds configuration of webcam frames
    'webcam' : {
        
        // should frames be converted to grayscale (default : false)
        //'grayscale' : true,
        
        // should width of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'width' : 800,
 
        // should height of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'height' : 600,
        
        // should a fake source be used instead of an actual webcam
        // suitable for debugging and development (default : false)
        'fake' : false,
        
        // framerate of the feed (default : 0)
        // provide 0 to match webcam input
        'framerate' : 25
    }
});







