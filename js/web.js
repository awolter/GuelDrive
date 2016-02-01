/**********************
 **      web.js      **
 **********************/

var socket = io();
// socket.io test
socket.emit('loadMessages');

var videoDirectory = "./Videos/";
var videos = [];


// testing function for current videos object
function printVideos(){
	for(var i in videos){
		console.log("Video #" + i + ": " + videos[i].name + ", filename: " + videos[i].filename);
	}
}

// generates buttons with each video name
function generateButtons(){

	// reset list (needed for multiple viewers at the same time!)
	$("#videoSelector").html("");

	for(var i in videos){
		if (videos.hasOwnProperty(i)) { //jQuery check
			//console.log("Video Name: " + videos[i].name);
			var button = $("<input type='button' value = '" + videos[i].name + "' onclick='switchVideo(" + i + ")'>");
			$("#videoSelector").append(button);
		}
	}
}


// switches the video player to the i-th video
function switchVideo(i){
	$('#currentVideo').attr("src", videoDirectory + videos[i].filename);
}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});

	// populate the videos list
	socket.on('videos', function(videoList){
		// reset the videos list (needed for multiple viewers at the same time!)
		videos.length = 0;
		printVideos();
		// set the videos list
		videos = videoList;
		printVideos();
		generateButtons();
	});
	
});