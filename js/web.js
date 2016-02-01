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
	//$('#currentVideo').attr("src", "/Videos/SpaceOddity.mp4");
}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});
	
	
});