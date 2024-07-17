//window.location.href = "https://www.youtube.com/watch?v=YUzmqrjmCeI";

// fix alignment with odd pixels and background percentages
function adjustMargin() {
	var width = window.document.body.offsetWidth;
	var x = Math.round(width / 2.0 - 960.0);
	x = -x;
	document.body.style.backgroundPosition =  x + "px 0, " + "px 0";
	document.getElementById("box").style.left = Math.round((width - 1000) / 2.0 - 0.2) + "px";
}

function checkOS() {
	var os = navigator.platform.toLowerCase();
	if (os == "win32")
	  return "windows";
	if (os == "macintosh")
	  return "macintosh";
	else if (os == "macintel")
	  return "macintosh";
	else if (os == "linux")
	  return "linux";
	else if (os.startsWith("linux i686"))
	  return "linux";
	else if (os.startsWith("linux x86_64"))
	  return "linux";
	return "none";
}

function downloadClick(e) {
	var os = checkOS();
	window.location.href = "/setup/?download#" + os;
	return false;
}

function videoPlay() {
	document.getElementById("player").play();
	return false;
}

function sendRequest(url, callback) {
	var r = new XMLHttpRequest();
	r.onload = function() { callback(r.responseText); }
	r.open("GET", url);
	r.send();
} 

function videoCaptions(markers) {
	if (typeof markers == "string")
		markers = eval(markers);
	var player = document.getElementById("player");
	var paused = true;
	var seek = $("#videoSeek").width();
	var marker = -1;
	var duration = -1;
	var time = 0;
	var interval =
	setInterval(function() {
		var currentTime = player.currentTime;
		var currentDuration = player.duration;
		if (player.paused != paused) {
			paused = player.paused;
			if (paused)
				$("#videoControl").css({backgroundPosition: "0 0"});
			else
				$("#videoControl").css({backgroundPosition: "20px 0"});
		}
		if (currentDuration > duration) {
			duration = currentDuration;
		}
		if (duration > 0 && time != currentTime) {
			time = currentTime;
			var cursor = Math.round((time / duration) * seek);
			$("#videoCursor").css({width: cursor + "px"});
			var minutes = Math.floor(time / 60);
			var seconds = Math.floor(time - minutes * 60);
			seconds = seconds.toString();
			if (seconds.length < 2)
				seconds = "0" + seconds;
			$("#videoTime").text(minutes.toString() + ":" + seconds);
		}
		var spot = -1;
		for (var i = 0; i < markers.length; i++)
		if (currentTime >= markers[i].start && currentTime <= markers[i].stop) {
			spot = i;
			break;
		}
		if (spot != marker) {
			marker = spot;
			if (marker < 0)
				$("#videoGroup").fadeOut();
			else {
				$("#videoTitle").html(markers[marker].title);
				$("#videoMessage").html(markers[marker].message);
				$("#videoGroup").fadeIn();
			}
		}
	}, 100);
	$("#videoRefresh").click(function() {
		$("#videoRefresh").unbind("click");
		clearInterval(interval)
		player.pause();
		player.currentTime = 0;
		$("#videoControl").css({backgroundPosition: "0 0"});
		$("#videoCursor").css({width: 0});
		$("#videoTime").text("0:00");
		sendRequest("markers.json", videoCaptions);
	});
}


function fancyAdjust() {
	setTimeout(window.adjustMargin, 10);
	setTimeout(window.adjustMargin, 100);
	setTimeout(window.adjustMargin, 250);
	setTimeout(window.adjustMargin, 500);
}

function initContent() {
	// syntax highlighter plugin
	console.log("SyntaxHighlighter.config");
	SyntaxHighlighter.config.stripBrs = true;
	SyntaxHighlighter.config.gutter = false;
	SyntaxHighlighter.highlight();
	// fancy box plug in
	$(".fancybox").fancybox({
		scrolling: "yes",
		beforeShow: fancyAdjust,
		afterClose: fancyAdjust
	});
	// tooltipster plugin
	$(".tooltip").tooltipster({
	    theme: "tooltipster-shadow",
	    contentAsHTML: true
	});
	// create video player titles and messages if player is present
	var player = document.getElementById("player");
	if (player) 
		$.ajax({
			url: "/templates/player.html",
			success: function(data) 
			{ 
				data = data.split("|");
				var div = document.createElement("DIV");
				div.innerHTML = data[0];
				player.parentNode.insertBefore(div, player); 
				div = document.createElement("DIV");
				div.innerHTML = data[1];
				player.parentNode.insertBefore(div, player.nextSibling); 
				$("#videoControl").click(function() {
					if (player.paused)
						player.play();
					else
						player.pause();
				});
				$("#videoSeek").click(function(e) {
					var offset = $(this).offset();
					var width = $(this).width();
					offset = e.clientX - offset.left;
					if (offset < 10) 
						offset = 0;
					else if (offset > width - 10)
						offset = width;
					offset = offset / width;
					player.currentTime = player.duration * offset;
				});
				sendRequest("markers.json", videoCaptions);
				/*$.ajax({
					url: "markers.html",
					success: function(data)
					{
						videoCaptions(eval(data));
					} 
				});*/
			}
		});
}

function showYouTube(caption, video, subtitle, width, height) {
	width = width ? width : 720;
	height = height ? height : 480;
	message = '<iframe width="' + width + '" height="' + height + '" src="https://www.youtube.com/embed/' +
		video + '?rel=0&amp;showinfo=0&html5=1" frameborder="0" allowfullscreen></iframe>';
	if (subtitle)
		message += '<div class="subtitle" style="max-width: ' + (width - 16) + 'px">' + subtitle + '</div>';
	var dialog = {
		title: caption,
		showClose: true,
		content: message,
		accept: "Close",
		animate: true
	};
	dialogShow(dialog);
	return true;
}

function showYouTube16x9(caption, video, subtitle) {
	return showYouTube(caption, video, subtitle, 856, 480);
}
	      
function showYouTube16x10(caption, video, subtitle) {
	return showYouTube(caption, video, subtitle, 720, 480);
}

function showImage(caption, image, width, height, subtitle) {
	message = '<img width="' + width + '" height="' + height + '" src="' + image + '">'
	if (subtitle)
		message += '<div class="subtitle" style="max-width: ' + (width - 16) + 'px">' + subtitle + '</div>';
	var dialog = {
		title: caption,
		showClose: true,
		content: message,
		accept: "Close",
		animate: true
	};
	dialogShow(dialog);
	return true;
}

function showMessage(caption, message) {
	var dialog = {
		title: caption,
		showClose: true,
		content: message,
		accept: "OK",
		animate: true
	};
	dialogShow(dialog);
	return true;
}

function addEvent(target, event, handler) {
  if (target.addEventListener) {
    target.addEventListener(event, function(e) { handler(e); }, false);
  } else if (target.attachEvent) {
    target.attachEvent("on" + event, function(e) { handler(e); } );
  }
}

function videoClick(e) {
	var video = e.target;
	if (video.init)
		return;
	video.className = "vodPlay";
	video.init = true;
	video.image = video.getAttribute("poster");
	video.setAttribute("controls", "controls");
	video.play();
	if (video.requestFullscreen) {
		video.requestFullscreen();
	} else if (video.mozRequestFullScreen) {
		video.mozRequestFullScreen();
	} else if (video.webkitRequestFullscreen) {
		video.webkitRequestFullscreen();
	}	
}

function videoEnded(e) {
	var video = e.target;
	video.init = false;
	video.className = "vod";
	video.removeAttribute("controls");
	video.removeAttribute("poster");
	var source = video.currentSrc;
	video.src = "";
	video.src = source;   
	video.setAttribute("poster", video.image);
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if(document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if(document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
	adjustMargin();
}

var bannerPages = null;
var dotInterval = null;
var dotTimeout = null;
var dotButtons = null;
var dotButtonMoving = false;
var dotIndex = 0;

function dotMove(index, clicked) {
	if (index == dotIndex)
		return;
	if (dotButtonMoving)	
		return;
	var oldIndex = dotIndex;
	var newIndex = index;
	var container = bannerPages[0].parentElement;
	if (bannerPages.length > 2) {
		var page = bannerPages[index];
		container.removeChild(page);
		container.insertBefore(page, container.children[1]);
	}
	dotButtonMoving = true;
	if (dotTimeout)
		clearTimeout(dotTimeout);
	dotTimeout = null;
	if (clicked)
		clearInterval(dotInterval);
	dotButtons[oldIndex].className = "dotButton";
	dotButtons[newIndex].className = "dotButton selected";
	var item = bannerPages[oldIndex];
	$(item).animate({
		marginLeft: -1000
	}, 1000, function() {
		container.removeChild(item);
		container.appendChild(item);
		item.style.marginLeft = 0;
		dotIndex = newIndex;
		dotButtonMoving = false;
		if (clicked)
			dotTimeout = setTimeout(function() {
				dotInterval = setInterval(dotScroll, 8000);	
			}, 15000);
	});
}

function dotButtonClick(e) {
	dotMove(e.target.buttonIndex, true)
}

function dotScroll() {
	var i = dotIndex + 1;
	if (i == dotButtons.length)
		i = 0;
	dotMove(i, false);
}

function initDots() {
	var bannerDots = document.getElementById("bannerDots");
	if (bannerDots == null)
		return;
	bannerPages = [];
	dotButtons = [];
	var pages = document.getElementsByClassName("bannerPage");
	for (var i = 0; i < pages.length; i++) {
		bannerPages.push(pages[i]);
		dotButtons.push(document.createElement("div"));
	}
	for (var i = dotButtons.length - 1; i > -1; i--) {
		var button = dotButtons[i];
		button.buttonIndex = i;
		bannerDots.appendChild(button);
		button.className = (i > 0) ? "dotButton" : "dotButton selected";
		addEvent(button, "click", dotButtonClick);
	}
	if (dotButtons.length > 1)
		dotInterval = setInterval(dotScroll, 8000);	
}

$(function() {
	var videos = document.getElementsByClassName("vod");
	for (var i = 0; i < videos.length; i++) {
    var video = videos[i];
    if (!video.hasAttribute("noclick")) {
      addEvent(video, "click", videoClick);
      addEvent(video, "ended", videoEnded);
    }
	}	
	initDots();
	var download = document.getElementById("download");
	addEvent(download, "click", downloadClick);
	addEvent(window, "resize", adjustMargin);
	adjustMargin();
	setTimeout(adjustMargin, 10);
	initContent();
});

adjustMargin();
document.getElementById("box").style.visibility = "visible";
