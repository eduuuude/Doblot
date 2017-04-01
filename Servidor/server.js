function getIndexBySocket(arr, value) {
  for (var i=0, iLen=arr.length; i<iLen; i++) {
    if (arr[i].socket == value) return i;
  }
}

function getOneBySocket(arr, value) {
  var index = getIndexBySocket(arr, value);
  return arr[index];
}

function getOneByName(arr, value) {
  for (var i=0, iLen=arr.length; i<iLen; i++) {
    if (arr[i].name == value) return arr[i];
  }
}

function getHumanDoblots(arr, value) {
  var resultArray = [];
  for (var i=0, iLen=arr.length; i<iLen; i++) {
    if (arr[i].propietary === value) {
      //console.log(connectedDoblots[i].name);
      resultArray.push(arr[i].name);
    }
  }
  return resultArray;
}

function getStateBySocket(arr, socket) {
  var object = getOneBySocket(arr, socket);
  return object.state;
}

function getIndexConnectionBySocket(connectedArray, socket) {
  for (var i = 0; i < connectedArray.length ; i++) {
    if (connectedArray[i].human.socket == socket || connectedArray[i].doblot.socket == socket ) {
      return i;
    }
  }
}

function getConnectionBySocket(connectedArray, socket) {
  var index = getIndexConnectionBySocket(connectedArray, socket);
  return connectedArray[index];
}

function createBridge(humanName, doblotName) {
  var foundHuman = getOneByName(connectedHumans, humanName);
  var foundDoblot = getOneByName(connectedDoblots, doblotName);

  activeConnections.push({
    doblot: foundDoblot,
    human: foundHuman
  });

  var connection = getConnectionBySocket(activeConnections, foundDoblot.socket);
  //console.log(index);

  connection.human.socket.on('humanMessage', function(data) {
    connection.doblot.socket.emit('humanMessage', data);
  });

  connection.doblot.socket.on('doblotMessage', function(data) {
    connection.human.socket.emit('doblotMessage', data);
  });

  connection.doblot.state = 'testing connection';
  connection.human.state = 'testing connection';

};

function deleteBridge (socket) {
  var connection = getConnectionBySocket(activeConnections, socket);
  if (connection != undefined) {
    connection.human.socket.removeAllListeners('humanMessage', function(data) {
      connection.doblot.socket.emit('humanMessage', data);
    });

    connection.doblot.socket.removeAllListeners('doblotMessage', function(data) {
      connection.human.socket.emit('doblotMessage', data);
    });

    connection.doblot.state = 'idle';
    connection.human.state = 'idle';
    var index = getConnectionBySocket(activeConnections, socket);
    activeConnections.splice(index,1);

    console.log('Active connections: ' + activeConnections.length);
  }
};

function controlMessageHandler(data, socket) {
  var connection = getConnectionBySocket(activeConnections, socket);
  console.log(data);
  if (data.type == 'connectionOK') {
    connection.human.state = 'connectionEstablished';
    connection.doblot.state = 'connectionEstablished';

    connection.human.socket.emit('controlMessage', {
      type: 'connectionEstablished',
      content: ''
    });

    connection.doblot.socket.emit('controlMessage', {
      type: 'connectionEstablished',
      content: ''
    });
  }
};

/////////////////////////
//A partir de aqui, se definen los evento de humano y de doblots y se arrancan los servidores

var ioDoblot = require('socket.io')();
var connectedDoblots = [];
var activeConnections = [];

ioDoblot.on('connection', function(doblotSocket){
  //Cuando se conecta un doblot, se añade a la array de doblot conectados
  console.log('Doblot connected');
  connectedDoblots.push({
      socket: doblotSocket,
      name: '',
      propietary: '',
      state: 'waiting info'
    });

  //evento para que cuando se reciba la informacion la informacion el doblot, quede
  doblotSocket.on('doblotInfo', function(data){
      var doblot = getOneBySocket(connectedDoblots , doblotSocket);
      doblot.name = data.name;
      doblot.propietary = data.propietary;
      doblot.state = 'idle';
      console.log('Doblot info: Name=' + doblot.name + ' Propietary=' + doblot.propietary );
  });

  //El controlMessageHandler es comun para humano y doblot
  doblotSocket.on('controlMessage', function(data) {
    controlMessageHandler(data, doblotSocket);
  });

  //Funcion para manejar la solicitud del doblot para deshacer el puente. 
  doblotSocket.on('releaseConnection', function(data) {
    //Se notifica al humano que el doblot se desconecta
    var connection = getConnectionBySocket(activeConnections, doblotSocket);
    connection.human.socket.emit('doblotDisconected',{});
    //deleteBridge solo acepta el socket como parametro de entrada. Busca el socket en activeConnections
    deleteBridge(doblotSocket);
    //Se envia al humano los doblots que tiene disponibles
    connection.human.socket.emit('doblotList', getHumanDoblots(connectedDoblots, connection.human.name));
  });


  doblotSocket.on('disconnect', function () {
     //Se notifica al humano que el soblot se desconecta
    if ( getStateBySocket(connectedDoblots ,doblotSocket) == 'connectionEstablished') {
      var connection = getConnectionBySocket(activeConnections, doblotSocket);
      //console.log(connection);
      connection.human.socket.emit('doblotDisconected',{});
      //deleteBridge solo acepta el socket como parametro de entrada. Busca el socket en activeConnections
      deleteBridge(doblotSocket);
      //connection.human.socket.emit('doblotList', getHumanDoblots(connectedDoblots, connection.human.name));
    }

    var index = getIndexBySocket(connectedDoblots , doblotSocket);
    connectedDoblots.splice(index, 1);
    
    console.log('Doblot disconnected');
  });
});
ioDoblot.listen(2000);


var appServerHuman = require('express')();
var httpServerHuman = require('http').Server(appServerHuman);

var ioHuman = require('socket.io')(httpServerHuman);

var connectedHumans = [];

appServerHuman.get('/', function(req, res){
  res.sendfile('index.html');
});

ioHuman.on('connection', function(humanSocket){
  connectedHumans.push( {
    socket: humanSocket,
    name: '',
    state: 'waiting info'
  });
  console.log('Human connected');

  

  humanSocket.on('humanInfo', function(data) {
    console.log('Human Info received');
    var human = getOneBySocket(connectedHumans , humanSocket);
    human.name = data.name;
    humanSocket.emit('doblotList', getHumanDoblots(connectedDoblots, human.name));
    human.state = 'idle';
  });

  humanSocket.on('doblotSelected', function(data) {
      var human = getOneBySocket( connectedHumans, humanSocket );

      //createBridge acepta como parametros de entrada el nombre del humano y el del robot. Une los sockets y establece el estado a 'testing connection'
      createBridge(human.name, data);

      //Funcion para testear la conexion
      humanSocket.emit('controlMessage', {
        type: 'connectionTest',
        content: ''
      });
    });

  //El controlMessageHandler es comun para humano y doblot
  humanSocket.on('controlMessage', function(data) {
    controlMessageHandler(data, humanSocket);
  });

  //Funcion para manejar la solicitud del humano para deshacer el puente. 
  humanSocket.on('releaseConnection', function(data) {
    //Se notifica al doblot que el humano se desconecta
    var connection = getConnectionBySocket(activeConnections ,humanSocket);
    connection.doblot.socket.emit('humanDisconected',{});
    //deleteBridge solo acepta el socket como parametro de entrada. Busca el socket en activeConnections
    deleteBridge(humanSocket);
    //Se envia al humano los doblots que tiene disponibles
    var human = getOneBySocket(connectedHumans , humanSocket);
    humanSocket.emit('doblotList', getHumanDoblots(connectedDoblots, human.name));
  });

  humanSocket.on('disconnect', function () {
    //Se notifica al doblot que el humano se desconecta
    if ( getStateBySocket(connectedHumans, humanSocket) == 'connectionEstablished') {
      var connection = getConnectionBySocket(activeConnections, humanSocket);
      connection.doblot.socket.emit('humanDisconected',{});
      //deleteBridge solo acepta el socket como parametro de entrada. Busca el socket en activeConnections
      deleteBridge(humanSocket);
    }
    
    var index = getIndexBySocket(connectedHumans , humanSocket);
    connectedHumans.splice(index, 1);

    console.log('Human disconnected');
  });

});
  httpServerHuman.listen(3000, function(){
    console.log('listening on *:3000');
});
