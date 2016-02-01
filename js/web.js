/**********************
 **      web.js      **
 **********************/

var socket = io();
// socket.io test
socket.emit('loadMessages');

var videoDirectory = "./Videos/";
var coversDirectory = "./Covers/";
var videos = [];


// testing function for current videos object
function printVideos(){
	for(var i in videos){
		console.log("Video #" + i + ": " + videos[i].name + ", filename: " + videos[i].filename);
	}
}

/*
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
} */

// generates tabs with each video name + image
function generateTabs(){

	// reset list (needed for multiple viewers at the same time!)
	$("#videoTabList").html("");


	for(var i in videos){
		if (videos.hasOwnProperty(i)) { //jQuery check

			var tab = $("<li><img src='" + coversDirectory + videos[i].name + videos[i].imageType + "' class='videoTab' onclick='switchVideo(" + i + ")' /></li>");

			$("#videoTabList").append(tab);
		}
	}

}

/* Find a better way to find the image
function findImage(name){
	// check if png exists
	if(imageExists(name + ".png")){
		return name + ".png";
	}
	// check if jpg exists
	if(imageExists(name + ".jpg")){
		return name + ".jpg";
	}
	// check if gif exists
	if(imageExists(name + ".gif")){
		return name + ".gif";
	}
}

function imageExists(filename)
{
	var img = new Image();
	img.src = coversDirectory + filename;
	return img.height != 0;
}
*/

// switches the video player to the i-th video
function switchVideo(i){

	// check that the i is a valid video
	if(i < videos.length){
		$('#currentVideo').attr("src", videoDirectory + videos[i].filename);
	}
	else{
		console.warn("Invalid switch attempt!");
	}
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
		//generateButtons();
		generateTabs();
	});
	
});