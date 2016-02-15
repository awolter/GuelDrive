/**********************
 **      web.js      **
 **********************/

var socket = io();

var videoDirectory = "./Videos/";
var moviesFolder = "Movies/";
var tvShowsFolder = "TVShows/";

//var videoDirectory = "./Volumes/WD/Movies/mp4/";
var coversDirectory = "./Covers/";

// lists of videos
var movies = [];
var tvShows = [];


// loading the page
function loadPage(){
	loadMoviesTab();
	socket.emit('clientStart');
}


// generates tabs with each movie name + image
function generateMovieTabs(){
	var movieTabList = $('#movieTabList');
	// reset list (needed for multiple viewers at the same time!)
	movieTabList.html("");

	// create tab for each movie
	for(var i in movies){
		if (movies.hasOwnProperty(i)) { //jQuery check

			var tab  = "";

			tab += "<li><label for='movieTab" + i + "' title='" + movies[i].name + "'>";
			tab += "<img src='" + coversDirectory + movies[i].name + movies[i].imageType;
			tab += "' id='movieTab" + i + "' class='videoTab' onclick='switchMovie(" + i + ")' />";
			tab += "</label></li>";


			movieTabList.append(tab);
		}
	}

}

// generates tabs with each tv show + image
function generateTVShowTabs(){
	var tvShowTabList = $('#tvShowTabList');
	// reset list (needed for multiple viewers at the same time!)
	tvShowTabList.html("");

	for(var i in tvShows){
		if(tvShows.hasOwnProperty(i)){

			var tab = "";

			tab += "<li><label for='tvShowTab" + i + "' title='" + tvShows[i].name + "'>";
			tab += "<img src='" + videoDirectory + tvShowsFolder + tvShows[i].name + "/cover" + tvShows[i].imageType;
			tab += "' id='tvShowTab" + i + "' class='videoTab' onclick='switchToEpisodeView(" + i + ")' />";
			tab += "</label></li>";

			tvShowTabList.append(tab);
		}
	}
}


// switches the movie player to the i-th movie
function switchMovie(i){
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

// switches the tv selector to the i-th tv show
function switchToEpisodeView(i){

	var tvShowEpisodeView = $('#tvShowEpisodeView');
	// reset list (needed for multiple viewers at the same time!)
	tvShowEpisodeView.html("");

	var tab = "";

	tab += "<label for='tvShowTab" + i + "' title='" + tvShows[i].name + "'>";
	tab += "<img src='" + videoDirectory + tvShowsFolder + tvShows[i].name + "/cover" + tvShows[i].imageType;
	tab += "' id='tvShowTab" + i + "' class='videoTab' onclick='loadTVShowsTab()' />";
	tab += "</label>";

	tvShowEpisodeView.append(tab);


	tvShowEpisodeView.show();
	$('#tvShowTabList').hide();
}

// load the movies tab
function loadMoviesTab(){
	// switch classes
	document.getElementById("moviesTabImg").className = "mediaTypeTabSelected";
	document.getElementById("tvShowsTabImg").className = "mediaTypeTabUnselected";

	// switch lists
	$('#movieTabList').show();
	$('#tvShowTabList').hide();
	$('#tvShowEpisodeView').hide();
}

// load the videos tab
function loadTVShowsTab(){
	// switch classes for tab
	document.getElementById("moviesTabImg").className = "mediaTypeTabUnselected";
	document.getElementById("tvShowsTabImg").className = "mediaTypeTabSelected";

	// switch lists
	$('#movieTabList').hide();
	$('#tvShowTabList').show();
	$('#tvShowEpisodeView').hide();
}


$(document).ready(function(){

	loadPage();

	socket.on('logMessage', function(msg){
		console.log(msg);
	});

	// populate the movies list
	socket.on('setMovies', function(movieList){
		// reset the movies list (needed for multiple viewers at the same time!)
		movies.length = 0;
		// set the movies list
		movies = movieList;

		// create movie tabs
		generateMovieTabs();
		console.log(movieList);
	});

	// populate the tv shows list
	socket.on('setTVShows', function(tvShowList){
		// reset the tv shows list (needed for multiple viewers at the same time!)
		tvShows.length = 0;
		// set the tv shows list
		tvShows = tvShowList;

		// create tv show tabs
		generateTVShowTabs();
		console.log(tvShowList);
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