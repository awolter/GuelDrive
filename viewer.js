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
var HOST = '192.168.1.138';

var videoDirectory = "./Videos/";
//var videoDirectory = "./Volumes/WD/Movies/DL/";

// for referencing files
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/Covers', express.static('covers'));
app.use('/js', express.static('js'));
app.use('/Videos', express.static('videos'));
app.use('/Volumes/WD/Movies/DL', express.static('Volumes/WD/Movies/DL'));

// websocket
io.on('connection', function(socket){

    // get the list of videos in the /Videos/ directory
    getVideoList();


    // for testing
    socket.on('loadMessages', function(){
        io.emit('setMessage', "Socket.io test successful.");
    });
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

// creates video objects, creates a list, and sends to client
function getVideoList(){
    var files = fs.readdirSync(videoDirectory);
    var videoList = [];
    for (var i in files) {
        if (files.hasOwnProperty(i)) {//jQuery check

            // split the array
            var fileStringArr = files[i].split(".");

            // create the video name
            var fileName = "";
            for(var j = 0; j < fileStringArr.length - 1; j++){
                fileName += fileStringArr[j];
                if(j < fileStringArr.length - 2){
                    fileName += ".";
                }
            }

            // create & test the filetype
            var fileType = fileStringArr[j];
            if (validMovieFileType(fileType)){

                // create video object
                var video = {
                    "name": fileName,
                    "filename": files[i],
                    "imageType": ".jpg"
                };
                videoList.push(video);
                console.log("Video[" + i + "]: " + JSON.stringify(video, null, 2));
            }
        }
    }

    io.emit('videos', videoList);
}

// test if a filetype is valid
function validMovieFileType(FILETYPE){
    console.log("FILE TYPE: " + FILETYPE);
    if(FILETYPE == null){ return false; }

    var s = FILETYPE.toLowerCase();
    if(s == "mkv" || s == "mp4" || s == "avi"){
        return true;
    }else{
        console.log("Invalid File Type: " + s);
    }
    return false;
}

