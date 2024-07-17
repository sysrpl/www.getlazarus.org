var original = "";
var preview = "";
var title = "";
var modes = ["edit", "original", "preview", "delete", "apply"];
var mode = null;

function getId(id) {
	return document.getElementById(id);
}

function normalize(s) {
	return s.trim().replace(/\s+/gm, " ");
}

function same(a, b) {
    return normalize(a) == normalize(b);
}

function updateEditorTools() {
	var edited = (mode != null);
	if (edited)
		$("#editor").children().removeClass("hidden");
	else
		$("#editor").children().addClass("hidden");
	for (var i = 0; i < modes.length; i++) {
		var name = (mode == modes[i]) ? "confirm" : "confirm, hidden";
		getId(modes[i] + "Confirm").className = name;
	}
	getId("edit").className = edited ? "hidden" : "";
	setTimeout(adjustMargin, 10);
}

// editor navigation event handlers
function clickEdit() {
	if (mode != "edit") {
		mode = "edit";
		$.ajax({
    		url: "?method=edit",
    		success: function (data) {
				console.log("edit");
				getId("path").innerHTML = title;
				getId("content").innerHTML = data;
				updateEditorTools();
		    }
		});
	}
	return false;
}

function clickOriginal() {
	if (mode != "original") {
		mode = "original";
		updateEditorTools();
		getId("path").innerHTML = document.title;
		getId("content").innerHTML = original;
	}
	return false;
}

function clickPreview() {
	if (mode != "preview") {
		mode = "preview";
		updateEditorTools();
		getId("path").innerHTML = title;
		getId("content").innerHTML = preview;
	}
	return false;
}

function clickDelete() {
	var prior = mode;
	if (mode != "delete") {
		mode = "delete";
		updateEditorTools();
		mode = prior;
	}
	return false;
}

function clickApply() {
	var prior = mode;
	if (mode != "apply") {
		mode = "apply";
		updateEditorTools();
		mode = prior;
	}
}

// confirm button click handlers
function clickEditSave() {
	var s = getId("wikititle").value.trim();
	if (s != "") {
		title = s;
		if (!same(title, document.title))
			$.post("?method=title", title);
	}
	s = getId("wikieditor").value.trim();
	if (s != "") {
		preview = s;
		if (!same(preview, original)) 
			$.post("?method=edit", preview);
	}
	clickPreview();
	return false;
}

function clickEditCancel() {
	location.reload();
	return false;
}

function clickDeleteYes() {
	$.post("?method=delete", function() { location.reload(); });
	return false;
}

function clickDeleteCancel() {
	updateEditorTools();
	return false;
}

function clickApplyYes() {
	if (title == "")
		time = document.title;
	if (preview == "")
		preview = original;
	var actions = 0;
	var applyTitle = !same(title, document.title);
	var applyPreview = !same(preview, original)
	if (applyTitle)
		actions++;
	if (applyPreview)
		actions++;
	console.log(actions);
	var applyComplete = function() {
		$.post("?method=apply", function() { location.reload(); });
	}
	if (actions == 0) {
		applyComplete();
		return false;
	}
	var update = function() {
		actions--;
		if (actions == 0)
			applyComplete();
	}
	if (applyTitle || applyTitle)
	{
		if (applyTitle)
			$.post("?method=title", title, update);
		if (applyPreview)
			$.post("?method=edit", preview, update);
	}
	else
		location.reload();
	return false;
}

function clickApplyCancel() {
	updateEditorTools();
	return false;
}

String.prototype.startsWith = function(s) {
  return this.slice(0, s.length) == s;
}

String.prototype.endsWith = function(s) {
  return s.length > 0 ? this.slice(this.length - s.length, this.length) == s : false;
}

String.prototype.replaceAll = function(find, replace) {
	return this.replace(new RegExp(find, 'g'), replace);
}

function shortcut(e) {
    if (e.ctrlKey) {
    	var editor = getId("wikieditor");
    	if (editor == null)
    		return;
	    var start = editor.selectionStart
    	var end = editor.selectionEnd;
    	var value = editor.value;
    	var text = value.slice(start, end);
    	var endline = text.endsWith("\n") ? "\n" : "";
    	text = text.trim();
    	switch (e.keyCode) {
	    	// Toggle source code when ctrl + enter is pressed
    		case 13:
		    	if (text.startsWith("<pre ")) {
		    		text = text.replaceAll("<pre class=\"brush: pas; collapse: false; ruler: false\">", "");
		    		text = text.replaceAll("</pre>", "");
		    		text = "`" + text.trim().replaceAll("&lt;", "<").replaceAll("&gt;", ">") + "`";
		    	} else if (text.startsWith("`") && text.endsWith("`")) {
		    		text = text.replaceAll("`", "");
		    		text = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
		    		text = "<pre class=\"brush: pas; collapse: false; ruler: false\">" + text + "</pre>";
				} else if (text.indexOf("`") > -1) {
			    	var head = true;
					while (text.indexOf("`") > -1) {
						text = text.replace("`", (head ? "<code>" : "</code>"));
						head = !head;
					}
				} else if (text.indexOf("`") > -1) { 
		    		text = text.replaceAll("<code>", "`").replaceAll("</code>", "`");
		    	} else
					return;
				break;
			// the < key
    		case 188:
		    	if (text.startsWith("<h1>")) {
		    		text = text.replaceAll("<h1>", "<div class=\"para\">");
		    		text = text.replaceAll("</h1>", "</div>");
		    	} else if (text.startsWith("<h2>")) {
		    		text = text.replaceAll("<h2>", "<h1>");
		    		text = text.replaceAll("</h2>", "</h1>");
		    	} else if (text.startsWith("<h3>")) {
		    		text = text.replaceAll("<h3>", "<h2>");
		    		text = text.replaceAll("</h3>", "</h2>");
				} else if (text.startsWith("<div class=\"para\">")) { 
		    		text = text.replaceAll("<div class=\"para\">", "<h3>");
		    		text = text.replaceAll("</div>", "</h3>");
		    	} else {
		    		text = "<div class=\"para\">" + text + "</div>";
		    	}
				break;
			// the > key
    		case 190:
		    	if (text.startsWith("<h1>")) {
		    		text = text.replaceAll("<h1>", "<h2>");
		    		text = text.replaceAll("</h1>", "</h2>");
		    	} else if (text.startsWith("<h2>")) {
		    		text = text.replaceAll("<h2>", "<h3>");
		    		text = text.replaceAll("</h2>", "</h3>");
		    	} else if (text.startsWith("<h3>")) {
		    		text = text.replaceAll("<h3>", "<div class=\"para\">");
		    		text = text.replaceAll("</h3>", "</div>");
				} else if (text.startsWith("<div class=\"para\">")) { 
		    		text = text.replaceAll("<div class=\"para\">", "<h1>");
		    		text = text.replaceAll("</div>", "</h1>");
		    	} else {
		    		text = "<h1>" + text + "</h1>";
		    	}
				break;
			default:
				return;
		}
		text += endline;
	    editor.value = value.slice(0, start) + text + value.slice(end);
		editor.selectionStart = start;
		editor.selectionEnd = start + text.length;
    }
}

document.addEventListener("keyup", shortcut, false);

function capify(title) {
    var small = ["a", "an", "the", "at", "by", "for", "in", "of",
		"on", "to", "up", "and", "as", "but", "it", "or", "nor"];
    var fixed = [];
    var words = title.split(" ");
    for (var i = 0; i < words.length; i++) {
    	var s = words[i];
    	if (s.length == 0)
    		continue;
		if (fixed.length == 0) {
			fixed.push(s.charAt(0).toUpperCase() + s.slice(1));
			continue;
		}
		var stripped = s.replace(/\W/g, "").toLowerCase();
		if (small.indexOf(stripped) < 0) 
			fixed.push(s.charAt(0).toUpperCase() + s.slice(1));
		else
			fixed.push(s.toLowerCase());
    }
    return fixed.join(" ");
}

// headers are tagged with hyperlink names
function linkify() {
	var fix = function(heading) {
		var text = heading.innerHTML;
		var name = text.replace(/\W/g, "_").toLowerCase();
		while (name.startsWith("_"))
			name = name.slice(1);
		while (name.endsWith("_"))
			name = name.slice(0, name.length - 1);
		heading.innerHTML = "<a name=\"" + name + "\" href=\"#" + name + "\">" + text + "</a>";
	}
    $("h1").each(function() { fix(this); });
    $("h2").each(function() { fix(this); });
    $("h3").each(function() { fix(this); });
    $("h4").each(function() { fix(this); });
    if (location.hash.length > 0) {
    	var hash = location.hash;
    	location.hash = "";
    	location.hash = hash;
	}
}

// page ready function
$(function() {
	$.ajax({
		url: "?method=title",
		success: function (data) 
		{ 
			title = data; 
			getId("path").innerHTML = title;
			$.ajax({
				url: "?method=original",
				success: function (data) 
				{ 
					original = data; 
					$.ajax({
						url: "?method=preview",
						success: function (data) 
						{ 
							preview = data; 
							if (title != document.title || original != preview)
								mode = "preview";
							updateEditorTools();
							linkify();
						}
					});
				}
			});
		}
	});
});