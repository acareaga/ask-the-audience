const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app)

// MAKE SURE SOCKET IO IS BELOW SERVER
const socketIo = require('socket.io');
const io = socketIo(server);
const port = process.env.PORT || 3000;

server.listen(port, function () { console.log('Listening on port ' + port + '.'); });

app.use(express.static('public'));

app.get('/', function (req, res){
  res.sendFile(__dirname + '/public/index.html');
});


// SOCKET IO CONNECTIONS
var votes = {};

io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  // io.sockets.emit to all clients
  io.sockets.emit('usersConnected', io.engine.clientsCount);

  // socket.emit to only one client
  socket.emit('statusMessage', 'You have connected.');

  // capture votes
  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      socket.emit('voteCount', countVotes(votes));
    }
  });

  // removes user votes on disconnect
  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    socket.emit('voteCount', countVotes(votes));
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});

// COUNT VOTES - REFACTOR w/LODASH
function countVotes(votes) {
  var voteCount = {
      A: 0,
      B: 0,
      C: 0,
      D: 0
  };
  for (var vote in votes) {
    voteCount[votes[vote]]++
  }
  return voteCount;
}

module.exports = server;
