/**********************
 **      web.js      **
 **********************/

var socket = io();
// socket.io test
socket.emit('loadMessages');

var videoDirectory = "./Videos/";
var moviesFolder = "Movies/";
//var videoDirectory = "./Volumes/WD/Movies/mp4/";
var coversDirectory = "./Covers/";
var movies = [];


// testing function for current movies object
function printMovies(){
	for(var i in movies){
		if (movies.hasOwnProperty(i)) { //jQuery check
			console.log("Movie #" + i + ": " + movies[i].name + ", filename: " + movies[i].filename);
		}
	}
}


// generates tabs with each movie name + image
function generateTabs(){
	var movieTabList = $('#movieTabList');
	// reset list (needed for multiple viewers at the same time!)
	movieTabList.html("");


	for(var i in movies){
		if (movies.hasOwnProperty(i)) { //jQuery check

			var tab  = "";

			tab += "<li><label for='movieTab" + i + "' title='" + movies[i].name + "'>";
			tab += "<img src='" + coversDirectory + movies[i].name + movies[i].imageType;
			tab += "' id='movieTab" + i + "' class='movieTab' onclick='switchMovie(" + i + ")' />";
			tab += "</label></li>";


			movieTabList.append(tab);
		}
	}

}


// switches the movie player to the i-th movie
function switchMovie(i){
	console.log("TEST");
	// clear the movie message
	$('#videoMessage').hide();

	// check that the i is a valid movie
	if(i < movies.length){
		$('#currentVideo').attr("src", videoDirectory + moviesFolder + movies[i].filename);
	}
	else{
		console.warn("Invalid movie switch attempt!");
	}
}


// switch the media type (0 is movies, 1 is tv shows)
function switchMediaType(i){
	// movies
	if(i == 0){
		// switch classes
		document.getElementById("moviesTabImg").className = "mediaTypeTabSelected";
		document.getElementById("tvShowsTabImg").className = "mediaTypeTabUnselected";
		// TODO: Switch the page to Movies
	}
	// tv shows
	else if(i == 1){
		// switch classes
		document.getElementById("moviesTabImg").className = "mediaTypeTabUnselected";
		document.getElementById("tvShowsTabImg").className = "mediaTypeTabSelected";
		// TODO: Switch the pages to TV shows
	}
	else{
		console.warn("Invalid Media Switch Attempt!");
	}

}


$(document).ready(function(){
	
	socket.on('setMessage', function(msg){
		console.log(msg);
	});

	// populate the movies list
	socket.on('setMovies', function(movieList){
		// reset the movies list (needed for multiple viewers at the same time!)
		movies.length = 0;
		printMovies();
		// set the movies list
		movies = movieList;
		printMovies();
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