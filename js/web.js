/**********************
 **      web.js      **
 **********************/

var socket = io();
// socket.io test
socket.emit('loadMessages');


var videos = [];


// TODO: make dynamic
var vid1 = {
	"name": "Test Video",
	"filename": "vidtest.mp4"
};

var vid2 = {
	"name": "Star Wars 7: The Force Awakens",
	"filename": "SW7.mkv"
};

var vid3 = {
	"name": "Space Oddity",
	"filename": "SpaceOddity.mp4"
};

videos.push(vid1);
videos.push(vid2);
videos.push(vid3);

printVideos();
// testing function for current videos object
function printVideos(){
	for(var i = 0; i < videos.length; i++){
		console.log("Video #" + i + ": " + videos[i].name + ", filename: " + videos[i].filename);
	}
}


function button(){
	console.log("print");
	socket.emit('print');
}

function switchVideo(i){
	//$('#currentVideo').attr("src", "/Videos/SpaceOddity.mp4");
	//$('#currentVideo').attr("src", "/Users/Adam/Dropbox/Code/Test/vidtest2.mp4");

	$('#currentVideo').attr("src", "/Videos/" + videos[i].filename);
}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});
	
	
});