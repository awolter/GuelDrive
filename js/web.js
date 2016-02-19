/**********************
 **      web.js      **
 **********************/

/** Global Variables **/

var socket = io();

// video directories
var videoDirectory = "./Videos/";
var moviesFolder = "Movies/";
var tvShowsFolder = "TVShows/";

// cover directory
var coversDirectory = "./Covers/";

// lists of videos
var movies = [];
var tvShows = [];

// state of the video player
var videoPlayerExpanded = false;


/** Page load **/

// loading the page
function loadPage(){
	// load the movies tab
	loadMoviesTab();
	// emit message to web server
	socket.emit('clientStart');
	// start the current video message faded out
	$("#currentVideoMessage").fadeOut();
}


/** Movie Functions **/

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
			tab += "' id='movieTab" + i + "' class='videoTab' onclick='switchMovie(" + i + ")' draggable='false'/>";
			tab += "</label></li>";


			movieTabList.append(tab);
		}
	}

}

// switches the movie player to the i-th movie
function switchMovie(i){
	// clear the empty video message
	$('#emptyVideoMessage').hide();

	// check that the i is a valid movie
	if(i < movies.length){
		$('#currentVideo').attr("src", videoDirectory + moviesFolder + movies[i].filename);
		// change the current video message
		setCurrentVideoMessage(movies[i].name);
	}
	else{
		console.warn("Invalid movie switch attempt!");
	}
}


/** TV Show Functions **/

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
			tab += "' id='tvShowTab" + i + "' class='videoTab' onclick='switchToEpisodeView(" + i + ")' draggable='false'/>";
			tab += "</label></li>";

			tvShowTabList.append(tab);
		}
	}
}


// switches the tv selector to the i-th tv show
function switchToEpisodeView(i){

	var tvShowEpisodeView = $('#tvShowEpisodeView');
	var tvShowEpisodeViewCover = $('#tvShowEpisodeViewCover');
	var tvShowEpisodeViewTitle = $('#tvShowEpisodeViewTitle');
	var tvShowEpisodeViewTabList = $('#tvShowEpisodeViewTabList');

	// reset the cover, title, and list view (needed for multiple viewers at the same time!)
	tvShowEpisodeViewCover.html("");
	tvShowEpisodeViewTitle.html("");
	tvShowEpisodeViewTabList.html("");

	// set the cover (and exit button)
	var exitButton = "";
	exitButton += "<label for='tvShowExit' title='Back to other TV shows'>";
	exitButton += "<img src='./images/exitButtonDark.png' draggable='false' id='exitEpisodeViewButton' onclick='loadTVShowsTab()'/>";
	tvShowEpisodeViewCover.append(exitButton);

	var tab = "";
	tab += "<label for='tvShowTab" + i + "' title='" + tvShows[i].name + "'>";
	tab += "<img src='" + videoDirectory + tvShowsFolder + tvShows[i].name + "/cover" + tvShows[i].imageType;
	tab += "' id='tvShowTab" + i + "' class='episodeViewCover' draggable='false'/>";
	tab += "</label>";
	tvShowEpisodeViewCover.append(tab);

	// set the title (and number of seasons/episodes)
	var tvTitle = tvShows[i].name + " - Seasons: " + tvShows[i].seasons.length;

	var episodeCount = 0;
	for(var ep in tvShows[i].seasons){
		episodeCount += tvShows[i].seasons[ep].episodes.length;
	}
	tvTitle += ", Episodes: " + episodeCount;
	tvShowEpisodeViewTitle.append(tvTitle);

	// populate the list of seasons + episodes
	var list = "";

	for(var j in tvShows[i].seasons){

		var curGroup = 0;

		list += "<li><div class='tvShowEpisodeViewTabSeason'>" + tvShows[i].seasons[j].name + "</div>";

		for(var k in tvShows[i].seasons[j].episodes){

			if(curGroup == 4){
				list += "</li><li><div class='tvShowEpisodeViewTabSeason'></div>";
				curGroup = 0;
			}
			list += "<label for='tv " + i + "," + j + "," + k +"' title='" + tvShows[i].seasons[j].episodes[k].name + "' >";
			list += "<div class='tvShowEpisodeViewTabEpisode' id='tv " + i + "," + j + "," + k +"'";
			list += " onclick='switchTVShow(" + i + "," + j + "," + k + ")'>"
			list += tvShows[i].seasons[j].episodes[k].name + "</div>";
			curGroup++;
		}

		list += "</li>";
	}

	tvShowEpisodeViewTabList.append(list);

	// show the div
	tvShowEpisodeView.show();
	$('#tvShowTabList').hide();
}

// switches the video player to the specified TV show
function switchTVShow(i,j,k){
	// clear the movie message
	$('#emptyVideoMessage').hide();

	var show = tvShows[i].name + "/";
	var season = tvShows[i].seasons[j].name + "/";
	var episode = tvShows[i].seasons[j].episodes[k].name + "." + tvShows[i].seasons[j].episodes[k].fileType;

	console.log("Playing: " + videoDirectory + tvShowsFolder + show + season + episode);

	// check that the i is a valid movie
	if(tvShows[i].seasons[j].episodes[k] != null){
		$('#currentVideo').attr("src", videoDirectory + tvShowsFolder + show + season + episode);
		setCurrentVideoMessage(tvShows[i].name + ": " + tvShows[i].seasons[j].name + " - " + tvShows[i].seasons[j].episodes[k].name);
	}
	else{
		console.warn("Invalid tv switch attempt!");
	}
}

/** Header media switching tabs **/

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


/** Setting the video message **/

function setCurrentVideoMessage(vidName){
	$("#currentVideoMessage").html("");
	$("#currentVideoMessage").append(vidName);
}

/** Expanding the video player **/

function toggleExpandingVideoPlayer(){
	// contract
	if(videoPlayerExpanded){
		videoPlayerExpanded = false;
		$("#videoPlayer").attr("style", "top:100;bottom:150;");
		$("#currentVideoMessage").attr("style", "top:105;left:15px;");
	}
	// expand
	else{
		videoPlayerExpanded = true;
		$("#videoPlayer").attr("style", "top:0;bottom:0;");
		$("#currentVideoMessage").attr("style", "top:15;left:15px;");
	}
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
		console.log("Movie List:");
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
		console.log("TV Show List:");
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

	// expands the video player to the entire page (not full screen)
	$("#videoPlayer").click(function(){
		toggleExpandingVideoPlayer();
	});

	// shows the current video message on mouseover and fades after timeout
	$("#videoPlayer").mouseover(function(){
		$("#currentVideoMessage").fadeIn();
		setTimeout(function(){
			$("#currentVideoMessage").fadeOut();
		}, 3000);
	});

});