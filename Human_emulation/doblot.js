var socket = require('socket.io-client')('http://localhost:3000');

var commandLineArgs = require('command-line-args');

var optionDefinitions = [
  { name: 'name', alias: 'n', type: String}
];

var options = commandLineArgs(optionDefinitions);

console.log(options.name);

var doblot;

var timer;

  //Recepcion de lista de doblots disponible

  socket.on('connect', function() {
    socket.emit('humanInfo', {
      name: options.name
    });
  })
  socket.on('doblotList', function(data) {
    doblot = data[0];
    console.log(data);
    socket.emit('doblotSelected', doblot);
  });

  socket.on('doblotMessage', function(data) {
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
        //Responder al doblot con el mismo mensaje
        socket.emit('humanMessage', {
          type: 'connectionTest',
          content: ''
        });
      }
    }
    else {
      console.log(data.content);
    }
  });

  socket.on('controlMessage', function(data) {
    if (data.type == 'connectionTest') {
      testStarter = true;
      socket.emit('humanMessage', {
        type: 'connectionTest',
        content: ''
      });
    }
    else if (data.type == 'connectionEstablished') {
      //comenzar a enviar datos o poner listener para teclas o algo asi.
      timer = setInterval( function() {
        socket.emit('humanMessage', {
          type: 'message',
          content: options.name
        });
      },1000);
    }
    else {
      console.log('Server message: ' + data.type + ' | ' + data.content);
    }
  });

  socket.on('doblotDisconnected', function(data) {
    //parar de enviar datos y algun alert para avisar de que se ha desconectado
    clearInterval(timer);
  });


  /////////////////////////////////////////////////////