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
var imdb = require('imdb-api');


// server host and port
var PORT = 1337;
var HOST = '127.0.0.1';


// Directories and folders
var videoDirectory = "./Videos/";
var moviesFolder = "Movies/";
var tvShowsFolder = "TVShows/";
var setupFileLocation = 'setup/';
var setupFileName = 'setup.json';

// for referencing files
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/Covers', express.static('Covers'));
app.use('/js', express.static('js'));
app.use('/Videos', express.static('Videos'));

readSetupFile();

// websocket
io.on('connection', function(socket){

    console.log("New viewer connected: " + socket.request.connection.remoteAddress);

    // get the list of movies and send them to the web client(s)
    getMovieList(socket.id);
    // get the list of tv shows and send them to the web client(s)
    //getTVShowList(socket.id);
});

// load webpage
app.get('/', function(req, res){
    console.log("viewer.html loaded");
    //noinspection JSUnresolvedVariable
    res.sendFile(__dirname + '/gueldrive.html', {maxAge: 0});
});

app.get('/movie/:filename', function(req, res){
    var file = videoDirectory + moviesFolder + req.params.filename;

    fs.stat(file, function(err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                // 404 Error if file not found
                return res.sendStatus(404);
            }
            res.end(err);
        }
        var range = req.headers.range;
        if (!range) {
            // 416 Wrong range
            return res.sendStatus(416);
        }
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        });

        var stream = fs.createReadStream(file, { start: start, end: end })
            .on("open", function() {
                stream.pipe(res);
            }).on("error", function(err) {
                res.end(err);
            });

    });
});

// creates video objects, creates a list, and sends to client
function getMovieList(socketId){
    //noinspection JSUnresolvedFunction
    var files;
    var movieList = [];

    try{
        files = fs.readdirSync(videoDirectory + moviesFolder);
    }catch(e) {
        console.error('Error reading videoDirectory + moviesFolder:');
        console.error(e);
    }

    files.forEach(function(file){
        if(file.indexOf('.') > -1 && !(file.indexOf('.avi') > -1)){
            console.log(file);
            if (file.charAt(0) != '.') {
                var filename = removeFileExtension(file);
                var fileType = getFileExtension(file);
                var movie = {};

                if(validVideoFileExtension(fileType)){
                    imdb.get(filename)
                        .then(function(data){
                            movie = {
                                uuid: uuid(),
                                name: data.title,
                                filename: file,
                                poster: data.poster
                            };
                            movieList.push(movie);
                            io.to(socketId).emit('movie', movie);
                        }, function(error){
                            console.log(error);
                            console.warn('Error with file: ' + filename);
                        });
                }else{
                    //notify invalid extension
                    //console.warn(fileType + ' is not supported');
                }
            }
        }
    });

    //console.log("Number of Movies loaded: " + movieList.length);
    //io.to(socketId).emit('setMovies', movieList);
}

function getTVShowList(socketId){
    // counter for number of episodes
    var count = 0;
    var shows;
    var tvShows = [];

    // iterate through the shows
    //noinspection JSUnresolvedFunction
    try{
        shows = fs.readdirSync(videoDirectory + tvShowsFolder);
    }catch(e) {
        console.error('Error reading videoDirectory + tvShowsFolder:');
        console.error(e);
    }

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
            var seasons = fs.readdirSync(videoDirectory + tvShowsFolder + shows[i] + "/"); //TODO - Surround in try/catch
            console.log(seasons);
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
    io.to(socketId).emit('setTVShows', tvShows);
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
    if(s == "mkv" || s == "mp4" || s == "flv" || s == "m4v"){
        //console.log("FILE TYPE: " + ex);
        return true;
    }else{
        console.log("Invalid File Type: " + s);
    }
    return false;
}

function readSetupFile(){
    if(!fs.existsSync(setupFileLocation + setupFileName)){
        console.log('Warning - ' + setupFileName + ' Does Not Exist');


    }else{
        fs.readFile(setupFileLocation + setupFileName, 'utf8', function(err, data){
            console.log('Getting File: ' + setupFileName);
            if(err){
                console.log('Error Reading AutoStart File.');
                return;
            }

            var setup = JSON.parse(data);

            videoDirectory = setup.videoDirectory;
            moviesFolder = setup.moviesFolder;
            tvShowsFolder = setup.tvShowsFolder;
            HOST = setup.host;
            PORT = setup.port;

            connect();
        });
    }
}

function connect() {
// creating server
    http.listen(PORT, HOST, function(){
        console.log('Socket listening on ' + HOST + ':' + PORT);
    });
}

//Credit: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript?page=1&tab=votes#tab-top
function uuid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
