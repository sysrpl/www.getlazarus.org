// fix alignment with odd pixels and background percentages
function adjustMargin() {
	var width = $(window).width();
	document.body.style.backgroundPosition = (Math.floor(width / 2) - 960) + "px 0";
	document.getElementById("box").style.marginLeft = (width % 2 == 1) ? "-501px" : "-500px";
}

function showPrompt(caption, message, callback) {
	var dialog = {
		title: caption,
		showClose: true,
		content: message,
		accept: "OK",
		onaccept: callback,
		cancel: "Cancel",
		animate: true
	};
	dialogShow(dialog);
	return true;
}


function deleteItem(element, path, filename) {

	function deleteConfirmed() {
		dialogHide();
		element = element.parentNode.parentNode;
		element.parentNode.removeChild(element);
		$.post("?method=delete&filename="+ path + filename);
	}

	showPrompt("Confirm Delete", "<br>" + path + filename + "<br><br>", deleteConfirmed);
	return false;
}

// page ready function
$(function() {
	$("#breadcrumb>a").hover(function() {
    	$(this).stop().animate({ opacity: 1}, 'fast');
  		}, function() {
    	$(this).stop().animate({ opacity: 0.7}, 'fast');
  	});
	$(".footLink").hover(function() {
    	$(this).stop().animate({ opacity: 1}, 'fast');
  		}, function() {
    	$(this).stop().animate({ opacity: 0.6}, 'fast');
  	});
	$(window).resize(adjustMargin);
	setTimeout(adjustMargin, 10);
});