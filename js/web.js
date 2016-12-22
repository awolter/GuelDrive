/*********************
 **	  web.js	  	**
 *********************/

/** Global Variables **/

var socket = io();

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
var $videoPlayer = $("#videoPlayer");
var $currentVideo = $("#currentVideo");
var $currentVideoMessage = $("#currentVideoMessage");
var $emptyVideoMessage = $('#emptyVideoMessage');
var $searchInput = $("#searchInput");
var $expandButton = $("#expandButton");
var $contractButton = $("#contractButton");

/** Page load **/

// loading the page
function loadPage(){
	// load the movies tab
	loadMoviesTab();
	// start the current video message faded out
	$currentVideoMessage.fadeOut();
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
			if($searchInput.val() == "" || movies[i].name.toLowerCase().indexOf($searchInput.val().toLowerCase()) > -1) {
				var tab = "";

				tab += "<li><label for='movieTab" + i + "' title='" + movies[i].name + "'>";
				tab += "<img src='" + movies[i].poster + "'";
				tab += "id='movieTab" + i + "' class='videoTab' onclick='switchMovie(" + i + ")' draggable='false'/>";
				tab += "</label></li>";

				movieTabList.append(tab);
			}
		}
	}
}

// switches the movie player to the i-th movie
function switchMovie(uuid){
	// clear the empty video message
	$emptyVideoMessage.hide();
	playingTVShow = false;
	var foundFlag = false;

	movies.forEach(function(movie){
		if(movie.uuid === uuid){
			$currentVideo.find('source').attr('src', 'movie/' + movie.filename);
			$currentVideo.find('source').attr('type', 'video/' + getVideoTypeAttr(movie.filename));
			$currentVideo[0].load();
			$currentVideo[0].play();
			setCurrentVideoMessage(movie.name);
			foundFlag = true;
		}
	});

	if(!foundFlag)
		console.warn('Invalid movie switch attempt!');
}


/** TV Show Functions **/

// generates tabs with each tv show + image
function generateTVShowTabs(){
	var tvShowTabList = $('#tvShowTabList');
	// reset list (needed for multiple viewers at the same time!)
	tvShowTabList.html("");

	for(var i in tvShows){
		if(tvShows.hasOwnProperty(i)){
			if($searchInput.val() == "" || getTVShowString(i).toLowerCase().indexOf($searchInput.val().toLowerCase()) > -1) {
				var tab = "";

				tab += "<li><label for='tvShowTab" + i + "' title='" + getTVShowString(i) + "'>";
				//tab += "<img src='" + videoDirectory + tvShowsFolder + getTVShowString(i) + "/cover" + tvShows[i].imageType;
				//tab += "' id='tvShowTab" + i + "' class='videoTab' onclick='switchToEpisodeView(" + i + ")' draggable='false'/>";
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
	tab += "<img src='" + tvShows[i].poster + "'";
	tab += "id='tvShowTab" + i + "' class='episodeViewCover' draggable='false'/>";
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
	$emptyVideoMessage.hide();

	var show = getTVShowString(i) + "/";
	var season = getSeasonString(i,j) + "/";
	var episode = getEpisodeString(i,j,k) + "." + tvShows[i].seasons[j].episodes[k].fileType;

	console.log("Playing: " + videoDirectory + tvShowsFolder + show + season + episode);

	// check that the i is a valid movie
	if(tvShows[i].seasons[j].episodes[k] != null){
		$currentVideo.attr("src", videoDirectory + tvShowsFolder + show + season + episode);
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
	$currentVideoMessage.html("");
	$currentVideoMessage.append(vidName);
}


/** Expanding the video player **/

function toggleExpandingVideoPlayer(){
	// contract
	if(videoPlayerExpanded){
		videoPlayerExpanded = false;
		$videoPlayer.attr("style", "top:100;bottom:150;");
		$currentVideoMessage.attr("style", "top:105;left:5px;");
	}
	// expand
	else{
		videoPlayerExpanded = true;
		$videoPlayer.attr("style", "top:0;bottom:0;");
		$currentVideoMessage.attr("style", "top:5;left:5px;");
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
		//console.log("Movie List:");
		//console.log(movieList);
	});

	socket.on('movie', function(movie){
		var movieTabList = $('#movieTabList');
		var tab = "";

		tab += "<li data-uuid='" + movie.uuid + "'><label for='movieTab' title='" + movie.name + "'>";
		tab += "<img src='" + movie.poster + "'";
		tab += "class='videoTab movieTab' draggable='false'/>";
		tab += "</label></li>";

		movieTabList.append(tab);
		movies.push(movie);
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

	socket.on('tvShow', function(tvShow){
		console.log(tvShow);
		var tvShowTabList = $('#tvShowTabList');
		var tab = "";

		tab += "<li data-uuid='" + tvShow.uuid + "'><label for='tvShowTab' title='" + tvShow.name + "'>";
		tab += "<img src='" + tvShow.poster + "'";
		tab += "class='videoTab tvShowTab' draggable='false'/>";
		tab += "</label></li>";

		tvShowTabList.append(tab);
		tvShows.push(tvShow);
	});

	// if space is pressed, it pauses/starts the current video
	$(document).on('keydown',function(e){
		var target = $(e.target);
		if(e.keyCode == 32 && !target.is('input,[contenteditable="true"],textarea')) { //If space is pressed outside a text field
			e.preventDefault();
			var video = $currentVideo[0];//[0] needed to get the HTML DOM Element
			if (video.paused){
				video.play();
			}
			else{
				video.pause();
			}
		}
	});

	$(document).on('click', '.movieTab', function(){
		var $target = $(this);
		var element;

		if($target.is('img'))
			element = $target.parent().parent();
		else if($target.is('label'))
			element = $target.parent();
		else
			element = $target;

		switchMovie(element.attr('data-uuid'));
	});

	// expands the video player to the entire page (not full screen)
	$expandButton.click(function(){
		$expandButton.hide();
		$contractButton.show();
		toggleExpandingVideoPlayer();
	});

	$contractButton.click(function(){
		$contractButton.hide();
		$expandButton.show();
		toggleExpandingVideoPlayer();
	});

	var moveTimer;
	var videoMessageHidden = true;
	// shows the current video message on mouseover and fades after no movement
	$videoPlayer.mousemove(function(){
		if (moveTimer) {
			clearTimeout(moveTimer);
		}
		if(videoMessageHidden) {
			$currentVideoMessage.show();
			if(videoPlayerExpanded){
				$contractButton.show();
			}
			else{
				$expandButton.show();
			}

			videoMessageHidden = false;
		}
		moveTimer = setTimeout(function() {
			$currentVideoMessage.fadeOut();
			if(videoPlayerExpanded){
				$contractButton.fadeOut();
			}
			else{
				$expandButton.fadeOut();
			}
			videoMessageHidden = true;
		}, 3000);
	});

	// either play the next episode or clear the video screen
	$currentVideo.on('ended',function(){
		console.log('Video has ended!');

		// auto play next tv show if you are watching a tv show with another episode
		if(playingTVShow == true && lastPlayedTVShow.episode < tvShows[lastPlayedTVShow.show].seasons[lastPlayedTVShow.season].episodes.length-1){
			switchTVShow(lastPlayedTVShow.show,lastPlayedTVShow.season,lastPlayedTVShow.episode+1);
		}
		// otherwise, clear the video screen
		else{
			playingTVShow = false;
			$currentVideo.attr("src","");
			$currentVideoMessage.html("");
			$emptyVideoMessage.show();
		}
	});

	// generate tabs upon input being added to search bar
	$searchInput.on('input',function(){
		generateMovieTabs();
		generateTVShowTabs();
	});
});

function getVideoTypeAttr(filename){
	switch(getFileExtension(filename)){
		case "mkv":
			return "mp4";
		case 'mp4':
			return "mp4";
		default:
			return "mp4";
	}
}

function getFileExtension(file){

	var fileArr = file.split(".");

	return fileArr[fileArr.length-1];
}