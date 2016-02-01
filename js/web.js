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
		if (videos.hasOwnProperty(i)) { //jQuery check
			console.log("Video #" + i + ": " + videos[i].name + ", filename: " + videos[i].filename);
		}
	}
}

/*
// generates buttons with each video name
function generateButtons(){
	var videoSelector = $("#videoSelector");
	// reset list (needed for multiple viewers at the same time!)
	vidSelector.html("");

	for(var i in videos){
		if (videos.hasOwnProperty(i)) { //jQuery check
			//console.log("Video Name: " + videos[i].name);
			var button = $("<input type='button' value = '" + videos[i].name + "' onclick='switchVideo(" + i + ")'>");
			videoSelector.append(button);
		}
	}
	//Prevents spacebar from restarting the currently playing video
	videoSelector.on('keydown', function(e){
		if(e.keyCode == 32){
			e.preventDefault();
			var video= $('#currentVideo')[0];//[0] needed to get the HTML DOM Element
			if (video.paused)
				video.play();
			else
				video.pause();
		}
	});
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


// switches the video player to the i-th video
function switchVideo(i){

	// clear the video message
	$('#videoMessage').html("");

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

	// if space is pressed, it pauses/starts the current video
	$(document).on('keydown',function(e){
		var target = $(e.target);
		if(e.keyCode == 32 && !target.is('input,[contenteditable="true"],textarea')) { //If space is pressed outside a text field
			e.preventDefault();
			var video= $('#currentVideo')[0];//[0] needed to get the HTML DOM Element
			if (video.paused)
				video.play();
			else
				video.pause();
		}
	});
});