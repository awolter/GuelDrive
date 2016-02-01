/**********************
 **      web.js      **
 **********************/

var socket = io();

socket.emit('loadMessages');




function button(){
	console.log("print");
	socket.emit('print');
}

function switchVideo(){
	//$('#currentVideo').attr("src", "/videos/SpaceOddity.mp4");
	$('#currentVideo').attr("src", "/Users/Adam/Dropbox/Code/Test/vidtest2.mp4");
}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});
	
	
});