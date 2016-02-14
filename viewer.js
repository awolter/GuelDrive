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
var moviesFolder = "Movies/";
var tvShowsFolder = "TVShows/";

//var videoDirectory = "./Volumes/WD/Movies/mp4/";

// for referencing files
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/Covers', express.static('covers'));
app.use('/js', express.static('js'));
app.use('/Videos', express.static('videos'));
//app.use('/Volumes/WD/Movies/mp4', express.static('Volumes/WD/Movies/mp4'));

// websocket
io.on('connection', function(socket){

    // get the list of videos in the /Videos/ directory
    getMovieList();

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
function getMovieList(){
    var files = fs.readdirSync(videoDirectory + moviesFolder);
    var movieList = [];
    for (var i in files) {
        if (files.hasOwnProperty(i)) {//jQuery check

            // split the array
            var fileStringArr = files[i].split(".");

            // create the movie name
            var fileName = "";
            for(var j = 0; j < fileStringArr.length - 1; j++){
                fileName += fileStringArr[j];
                if(j < fileStringArr.length - 2){
                    fileName += ".";
                }
            }

            // create & test the filetype
            var fileType = fileStringArr[j];
            if (validVideoFileType(fileType)){

                // create movie object
                var movie = {
                    "name": fileName,
                    "filename": files[i],
                    "imageType": ".jpg"
                };
                movieList.push(movie);
                //console.log("Movie[" + i + "]: " + JSON.stringify(movie, null, 2));
            }
        }
    }
    console.log("Number of movies loaded: " + movieList.length);
    io.emit('setMovies', movieList);
}

// test if a filetype is valid
function validVideoFileType(FILETYPE){

    if(FILETYPE == null){ return false; }

    var s = FILETYPE.toLowerCase();
    if(s == "mkv" || s == "mp4" || s == "avi" || s == "m4v"){
        //console.log("FILE TYPE: " + FILETYPE);
        return true;
    }else{
        //console.log("Invalid File Type: " + s);
    }
    return false;
}

