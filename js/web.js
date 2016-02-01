/**********************
 **      web.js      **
 **********************/

var socket = io();
// socket.io test
socket.emit('loadMessages');

var videoDirectory = "./Videos/";
var videos = [];






//var vid1 = {
//	"name": "Test Video",
//	"filename": "vidtest.mp4"
//};
//
//var vid2 = {
//	"name": "Star Wars 7: The Force Awakens",
//	"filename": "SW7.mkv"
//};
//
//var vid3 = {
//	"name": "Space Oddity",
//	"filename": "SpaceOddity.mp4"
//};
//
//videos.push(vid1);
//videos.push(vid2);
//videos.push(vid3);

// testing function for current videos object
function printVideos(){
	for(var i = 0; i < videos.length; i++){
		console.log("Video #" + i + ": " + videos[i].name + ", filename: " + videos[i].filename);
	}
}

function generateButtons(){
	for(var i in videos){
		if (videos.hasOwnProperty(i)) { //jQuery check
			console.log("Video Name: " + videos[i].name);
			var button = $("<input type='button' value = '" + videos[i].name + "' onclick='switchVideo(" + i + ")'>");
			$("#videoButtons").append(button);
		}
	}
}


function button(){
	console.log("print");
	socket.emit('print');
}

function switchVideo(i){
	//$('#currentVideo').attr("src", "/Videos/SpaceOddity.mp4");
	//$('#currentVideo').attr("src", "/Users/Adam/Dropbox/Code/Test/vidtest2.mp4");

	$('#currentVideo').attr("src", videoDirectory + videos[i].filename);
}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});

	socket.on('videos', function(videoList){
		videos=videoList;
		printVideos();
		generateButtons();
	});
	
});