/***********************
 **     viewer.js     **
 **  NODE.JS SERVER   **
 ***********************/

// for express and socket
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require("url");
var path = require("path");

// server host and port
var PORT = 1337; //40143?
//var HOST = '127.0.0.1';
var HOST = '10.26.67.68';

// for referencing files
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/js', express.static('js'));
app.use('/videos', express.static('videos'));
app.use('/Volumes/AMAZON', express.static('Volumes/AMAZON')); // (Doesn't work)

// websocket
io.on('connection', function(socket){
    socket.on('loadMessages', function(){
        io.emit('setMessage', "Socket.io test successful.");
    });

    socket.on('print', function(){
        console.log(vidStreamer);
    })

});

// load webpage
app.get('/', function(req, res){
    console.log("viewer.html loaded");
    res.sendFile(__dirname + '/viewer.html', {maxAge: 0});
});

// creating server
http.listen(PORT, HOST, function(){
    console.log('Socket listening on ' + HOST + ':' + PORT);
});



