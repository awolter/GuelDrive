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
var playingTVShow = false;
var lastPlayedTVShow = {};

// jQuery selectors
var videoPlayer_jQ = $("#videoPlayer");
var currentVideo_jQ = $("#currentVideo");
var currentVideoMessage_jQ = $("#currentVideoMessage");
var emptyVideoMessage_jQ = $('#emptyVideoMessage');
var searchInput_jQ = $("#searchInput");
var expandButton_jQ = $("#expandButton");
var contractButton_jQ = $("#contractButton");

/** Page load **/

// loading the page
function loadPage(){
	// load the movies tab
	loadMoviesTab();
	// emit message to web server
	socket.emit('clientStart');
	// start the current video message faded out
	currentVideoMessage_jQ.fadeOut();
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
			// only generate tabs that meet the search criteria
			if(searchInput_jQ.val().toLowerCase() == "" || movies[i].name.toLowerCase().indexOf(searchInput_jQ.val().toLowerCase()) > -1) {
				var tab = "";

				tab += "<li><label for='movieTab" + i + "' title='" + movies[i].name + "'>";
				tab += "<img src='" + coversDirectory + movies[i].name + movies[i].imageType;
				tab += "' id='movieTab" + i + "' class='videoTab' onclick='switchMovie(" + i + ")' draggable='false'/>";
				tab += "</label></li>";

				movieTabList.append(tab);
			}
		}
	}

}

// switches the movie player to the i-th movie
function switchMovie(i){
	// clear the empty video message
	emptyVideoMessage_jQ.hide();
	playingTVShow = false;

	// check that the i is a valid movie
	if(i < movies.length){
		currentVideo_jQ.attr("src", videoDirectory + moviesFolder + movies[i].filename);
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
			if(searchInput_jQ.val().toLowerCase() == "" || getTVShowString(i).toLowerCase().indexOf(searchInput_jQ.val().toLowerCase()) > -1) {
				var tab = "";

				tab += "<li><label for='tvShowTab" + i + "' title='" + getTVShowString(i) + "'>";
				tab += "<img src='" + videoDirectory + tvShowsFolder + getTVShowString(i) + "/cover" + tvShows[i].imageType;
				tab += "' id='tvShowTab" + i + "' class='videoTab' onclick='switchToEpisodeView(" + i + ")' draggable='false'/>";
				tab += "</label></li>";

				tvShowTabList.append(tab);
			}
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
	exitButton += "<img src='/images/exitButtonDark.png' draggable='false' id='exitEpisodeViewButton' onclick='loadTVShowsTab()'/>";
	tvShowEpisodeViewCover.append(exitButton);

	var tab = "";
	tab += "<label for='tvShowTab" + i + "' title='" + getTVShowString(i) + "'>";
	tab += "<img src='" + videoDirectory + tvShowsFolder + getTVShowString(i) + "/cover" + tvShows[i].imageType;
	tab += "' id='tvShowTab" + i + "' class='episodeViewCover' draggable='false'/>";
	tab += "</label>";
	tvShowEpisodeViewCover.append(tab);

	// set the title (and number of seasons/episodes)
	var tvTitle = getTVShowString(i) + " - Seasons: " + tvShows[i].seasons.length;

	var episodeCount = 0;
	for(var ep = 0; ep < tvShows[i].seasons.length; ep++){
		episodeCount += tvShows[i].seasons[ep].episodes.length;
	}
	tvTitle += ", Episodes: " + episodeCount;
	tvShowEpisodeViewTitle.append(tvTitle);

	// populate the list of seasons + episodes
	var list = "";

	for(var j = 0; j < tvShows[i].seasons.length; j++){

		var curGroup = 0;

		list += "<li><div class='tvShowEpisodeViewTabSeason'>" + getSeasonString(i,j) + "</div>";

		for(var k = 0; k < tvShows[i].seasons[j].episodes.length; k++){

			if(curGroup == 4){
				list += "</li><li><div class='tvShowEpisodeViewTabSeason'></div>";
				curGroup = 0;
			}
			list += "<label for='tv " + i + "," + j + "," + k +"' title='" + getEpisodeString(i,j,k) + "' >";
			list += "<div class='tvShowEpisodeViewTabEpisode' id='tv " + i + "," + j + "," + k +"'";
			list += " onclick='switchTVShow(" + i + "," + j + "," + k + ")'>";
			list += getEpisodeString(i,j,k) + "</div>";
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
	emptyVideoMessage_jQ.hide();

	var show = getTVShowString(i) + "/";
	var season = getSeasonString(i,j) + "/";
	var episode = getEpisodeString(i,j,k) + "." + tvShows[i].seasons[j].episodes[k].fileType;

	console.log("Playing: " + videoDirectory + tvShowsFolder + show + season + episode);

	// check that the i is a valid movie
	if(tvShows[i].seasons[j].episodes[k] != null){
		currentVideo_jQ.attr("src", videoDirectory + tvShowsFolder + show + season + episode);
		setCurrentVideoMessage(getTVShowString(i) + ": " + getSeasonString(i,j) + ", " + getEpisodeString(i,j,k));
		lastPlayedTVShow.show = i;
		lastPlayedTVShow.season = j;
		lastPlayedTVShow.episode = k;
		playingTVShow = true;
	}
	else{
		console.warn("Invalid tv switch attempt!");
	}
}

// returns the tv show name string
function getTVShowString(i){
	return tvShows[i].name;
}

// returns the tv show's season string name
function getSeasonString(i,j){
	return tvShows[i].seasons[j].name;
}

// returns the tv show's episode name in a specific season
function getEpisodeString(i,j,k){
	return tvShows[i].seasons[j].episodes[k].name
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


/** Video Message **/

function setCurrentVideoMessage(vidName){
	currentVideoMessage_jQ.html("");
	currentVideoMessage_jQ.append(vidName);
}


/** Expanding the video player **/

function toggleExpandingVideoPlayer(){
	// contract
	if(videoPlayerExpanded){
		videoPlayerExpanded = false;
		videoPlayer_jQ.attr("style", "top:100;bottom:150;");
		currentVideoMessage_jQ.attr("style", "top:105;left:15px;");
	}
	// expand
	else{
		videoPlayerExpanded = true;
		videoPlayer_jQ.attr("style", "top:0;bottom:0;");
		currentVideoMessage_jQ.attr("style", "top:15;left:15px;");
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
			var video = currentVideo_jQ[0];//[0] needed to get the HTML DOM Element
			if (video.paused)
				video.play();
			else
				video.pause();
		}
	});

	// expands the video player to the entire page (not full screen)
	expandButton_jQ.click(function(){
		expandButton_jQ.hide();
		contractButton_jQ.show();
		toggleExpandingVideoPlayer();
	});

	contractButton_jQ.click(function(){
		contractButton_jQ.hide();
		expandButton_jQ.show();
		toggleExpandingVideoPlayer();
	});

	var moveTimer;
	var videoMessageHidden = true;
	// shows the current video message on mouseover and fades after no movement
	videoPlayer_jQ.mousemove(function(){
		if (moveTimer) {
			clearTimeout(moveTimer);
		}
		if(videoMessageHidden) {
			currentVideoMessage_jQ.fadeIn();
			if(videoPlayerExpanded){
				contractButton_jQ.fadeIn();
			}
			else{
				expandButton_jQ.fadeIn();
			}

			videoMessageHidden = false;
		}
		moveTimer = setTimeout(function() {
			currentVideoMessage_jQ.fadeOut();
			if(videoPlayerExpanded){
				contractButton_jQ.fadeOut();
			}
			else{
				expandButton_jQ.fadeOut();
			}
			videoMessageHidden = true;
		}, 3000);
	});

	// either play the next episode or clear the video screen
	currentVideo_jQ.on('ended',function(){
		console.log('Video has ended!');

		// auto play next tv show if you are watching a tv show with another episode
		if(playingTVShow == true && lastPlayedTVShow.episode < tvShows[lastPlayedTVShow.show].seasons[lastPlayedTVShow.season].episodes.length-1){
			switchTVShow(lastPlayedTVShow.show,lastPlayedTVShow.season,lastPlayedTVShow.episode+1);
		}
		// otherwise, clear the video screen
		else{
			playingTVShow = false;
			currentVideo_jQ.attr("src","");
			currentVideoMessage_jQ.html("");
			emptyVideoMessage_jQ.show();
		}
	});

	// generate tabs upon input being added to search bar
	searchInput_jQ.on('input',function(){
		generateMovieTabs();
		generateTVShowTabs();
	});

});

