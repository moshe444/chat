
// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var userPool = [];
var usernames = [];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  var newClient = socket.handshake;
  console.log('New connection from ' + newClient.address + ' on ' + newClient.time);

  socket.on("send message", function(data){
    console.log(data);
    if(data.to == "all"){
      io.emit("new message", {
        name: socket.username,
        icon: socket.icon,
        msg: data
      });
    }else{
      io.emit("whisper", {
        name: socket.username,
        icon: socket.icon,
        msg: data
      });
    }
  });

  socket.on("new user", function(data, callback){
    if(usernames.indexOf(data.name) != -1){
      callback(false);
    }else{
      callback(true);
      socket.username = data.name;
      socket.icon = data.icon;
      var obj = {
        name: socket.username,
        icon: socket.icon
      };
      userPool.push(obj);
      usernames.push(socket.username);
      updateUserPool();
      io.emit("show info new user", data)
    }
  });

  socket.on("disconnect", function(data){
    if(!socket.username) return;
    console.log(data);
    for(var i=0;i<userPool.length;i++){
      if(userPool[i].name == socket.username){
        userPool.splice(i, 1);
      }
    }
    updateUserPool();
    io.emit("show info disconnect", socket.username);
    console.log('Disconnected from ' + newClient.address + ' on ' + newClient.time);
  });

  function updateUserPool(){
    io.emit("add user", userPool);
  }

});
