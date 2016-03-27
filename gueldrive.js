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
var PORT = 1337;
var HOST = '127.0.0.1';


// Directories and folders
var videoDirectory = "./Videos/";
var moviesFolder = "Movies/";
var tvShowsFolder = "TVShows/";


// for referencing files
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/Covers', express.static('Covers'));
app.use('/js', express.static('js'));
app.use('/Videos', express.static('Videos'));


// websocket
io.on('connection', function(socket){

    // get the list of movies and send them to the web client(s)
    getMovieList();
    // get the list of tv shows and send them to the web client(s)
    getTVShowList();

    // for testing
    socket.on('clientStart', function(){
        io.emit('logMessage', "Socket.io connection successful.");
    });
});

// load webpage
app.get('/', function(req, res){
    console.log("viewer.html loaded");
    //noinspection JSUnresolvedVariable
    res.sendFile(__dirname + '/gueldrive.html', {maxAge: 0});
});

// creating server
http.listen(PORT, HOST, function(){
    console.log('Socket listening on ' + HOST + ':' + PORT);
});

// creates video objects, creates a list, and sends to client
function getMovieList(){
    //noinspection JSUnresolvedFunction
    var files = fs.readdirSync(videoDirectory + moviesFolder);
    var movieList = [];
    for(var i in files){
        if(files.hasOwnProperty(i) && files[i].charAt(0) != "."){ //jQuery check

            // get the file name without extension
            var fileName = removeFileExtension(files[i]);

            // create & test the file type
            var fileType = getFileExtension(files[i]);

            if(validVideoFileExtension(fileType)){

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
    console.log("Number of Movies loaded: " + movieList.length);
    io.emit('setMovies', movieList);
}

function getTVShowList(){
    // counter for number of episodes
    var count = 0;

    var tvShows = [];

    // iterate through the shows
    //noinspection JSUnresolvedFunction
    var shows = fs.readdirSync(videoDirectory + tvShowsFolder);
    for(var i in shows){
        if(shows.hasOwnProperty(i) && shows[i].charAt(0) != "."){ //jQuery check

            // add show to list
            var show = {
                "name" : shows[i],
                "imageType" : "default"
            };
            show.seasons = [];

            // iterate through the seasons
            //noinspection JSUnresolvedFunction
            var seasons = fs.readdirSync(videoDirectory + tvShowsFolder + shows[i] + "/");
            for(var j in seasons) {
                if (seasons.hasOwnProperty(j) && seasons[j].charAt(0) != ".") { //jQuery check

                    // make sure it is not the cover image
                    if(removeFileExtension(seasons[j]) != "cover") {

                        // add season to seasons list
                        var season = {
                            "name": seasons[j]
                        };
                        season.episodes = [];

                        // iterate through the episodes
                        //noinspection JSUnresolvedFunction
                        var episodes = fs.readdirSync(videoDirectory + tvShowsFolder + shows[i] + "/" + seasons[j] + "/");
                        for (var k in episodes) {
                            //console.log(i + j + k);
                            if (episodes.hasOwnProperty(k) && episodes[k].charAt(0) != ".") { //jQuery check
                                // check that the file is of valid type
                                //console.log(i + j + k);
                                if (validVideoFileExtension(getFileExtension(episodes[k]))) {
                                    //console.log(i + j + k);
                                    // add episode to episodes list
                                    var episode = {
                                        "name": removeFileExtension(episodes[k]),
                                        "fileType": getFileExtension(episodes[k])
                                    };
                                    count++;
                                    season.episodes.push(episode);
                                }
                            }
                        }
                        show.seasons.push(season);
                    }
                    // set cover image type
                    else{
                        show.imageType = "." + getFileExtension(seasons[j]);
                    }
                }
            }
            tvShows.push(show);
        }
    }
    //console.log(JSON.stringify(tvShows,null,2));
    console.log("Number of TV Show episodes loaded: " + count);
    io.emit('setTVShows', tvShows);
}

// parses the file extension from a full file name
function getFileExtension(file){

    var fileArr = file.split(".");

    return fileArr[fileArr.length-1];
}

// removes the file extension from a full file name
function removeFileExtension(file){
    // split the file name by period
    var fileArr = file.split(".");

    var fileName = "";
    for(var j = 0; j < fileArr.length - 1; j++){
        fileName += fileArr[j];
        if(j < fileArr.length - 2){
            fileName += ".";
        }
    }

    return fileName;
}

// test if a file type is valid
function validVideoFileExtension(ex){

    if(ex == null){ return false; }

    var s = ex.toLowerCase();
    if(s == "mkv" || s == "mp4" || s == "avi" || s == "m4v"){
        //console.log("FILE TYPE: " + ex);
        return true;
    }else{
        console.log("Invalid File Type: " + s);
    }
    return false;
}

