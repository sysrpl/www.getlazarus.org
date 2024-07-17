var original = "";
var preview = "";
var review = false;
var filename = "";
var title = "";
var modes = ["edit", "original", "preview", "delete", "apply"];
var mode = null;
var wrap = true;

function getId(id) {
	return document.getElementById(id);
}

function updateWrap() {
	getId("wrapToggle").innerText = "line wrap: " + (wrap ? "on" : "off");
	if (wrap) {
		$("#wikieditor").attr("wrap", "on");
	} else {
		$("#wikieditor").attr("wrap", "off");
	}
}

function toggleWrap() {
	wrap = !wrap;
	updateWrap();
	return false;
}

function normalize(s) {
	return s.trim().replace(/\s+/gm, " ");
}

function same(a, b) {
    return normalize(a) == normalize(b);
}

function execScripts(node) {

	function nodeNameEquals(elem, name) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	}

	function evalScript(elem) {
		var data = (elem.text || elem.textContent || elem.innerHTML || "" );
		var head = document.getElementsByTagName("head")[0] || document.documentElement;
		var script = document.createElement("script");
		script.type = "text/javascript";
		try {
			script.appendChild(document.createTextNode(data));
		} catch(e) {
			script.text = data;
		}
		head.insertBefore(script, head.firstChild);
		head.removeChild(script);
	}

	var scripts = [], script;
	var children = node.childNodes,	child;
	for (var i = 0; children[i]; i++) {
		child = children[i];
		if (nodeNameEquals(child, "script") && (!child.type || child.type.toLowerCase() === "text/javascript"))
			scripts.push(child);
	}
	for (var i = 0; scripts[i]; i++) {
		script = scripts[i];
    	if (script.parentNode)
    		script.parentNode.removeChild(script);
		evalScript(scripts[i]);
	}
}

function updateContent(value) {
	var content = getId("content");
	content.innerHTML = value;
	initContent();
	execScripts(content);
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
		var method = mode;
		if (review)
			method += "&filename=" + filename;
		$.ajax({
    		url: "?action=render-editor", // + method,
    		success: function (data) {
				getId("path").innerHTML = title;
				updateContent(data);
				updateEditorTools();
				$("#wikieditor").linedtextarea();
				updateWrap();
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
		updateContent(original);
	}
	return false;
}

function clickPreview() {
	if (mode != "preview") {
		mode = "preview";
		updateEditorTools();
		getId("path").innerHTML = title;
		updateContent(preview);
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
			$.post("?action=save-title", title);
	}
	s = getId("wikieditor").value.trim();
	if (s != "") {
		preview = s;
		if (!same(preview, original))
			$.post("?action=save-content", preview);
	}
	clickPreview();
	return false;
}

function clickEditCancel() {
	if (title == "")
		time = document.title;
	if (preview == "")
		preview = original;
	var editedTitle = !same(title, document.title);
	var editedPreview = !same(preview, original);
	if (editedPreview || editedTitle) {
		getId("path").innerHTML = editedPreview ? title : document.title;
		updateContent(editedPreview ? preview : original);
		mode = "preview";
	} else {
		title = document.title;
		preview = original;
		getId("path").innerHTML = document.title;
		updateContent(original);
		mode = null;
	}
	updateEditorTools();
	return false;
}

function clickDeleteYes() {
	title = document.title;
	preview = original;
	getId("path").innerHTML = document.title;
	updateContent(original);
	mode = null;
	updateEditorTools();
	$.post("?action=delete-edits");
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
		$.post("?action=apply-edits");
		original = preview;
		document.title = title;
		getId("path").innerHTML = document.title;
		updateContent(original);
		mode = null;
		updateEditorTools();
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
	if (applyTitle)
		$.post("?action=apply-title", title, update);
	if (applyPreview)
		$.post("?action=apply-content", preview, update);
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
		    		text = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
			    	var head = true;
					while (text.indexOf("`") > -1) {
						text = text.replace("`", (head ? "<div class=\"snip\">" : "</div>"));
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
	console.log("linkify start");
	let items = document.querySelectorAll("h1, h2, h3, h4")
	let toc = document.querySelector("#toc");

	function fix(heading) {
		let text = heading.innerHTML;
		let name = text.replace(/\W/g, "_").toLowerCase();
		while (name.startsWith("_"))
			name = name.slice(1);
		while (name.endsWith("_"))
			name = name.slice(0, name.length - 1);
		heading.innerHTML = "<a name=\"" + name + "\" href=\"#" + name + "\">" + text + "</a>";
		return {
			"name": name,
			"text": text
		}
	}

	function fixToc() {
		let contents = `<div>Contents</div><ul>`;
		let level = 0;
		let t1 = 0;
		let t2 = 0;
		let t3 = 0;
		for (let i = 0; i < items.length; i++) {
			let h = items[i];
			let tag = h.tagName;
			let pair = fix(h);
			if (pair.name == "see_also")
				break;
			switch (tag) {
				case "H1":
				case "H2":
					t1++;
					while (level > 0) {
						contents += `</li></ul>`;
						level--;
					}
					if (t1 == 1)
						contents += `<li><a href="#${pair.name}"><span class="tocno">${t1}. </span>Overview</a>`;
                    else
						contents += `</li><li><a href="#${pair.name}"><span class="tocno">${t1}. </span>${pair.text}</a>`;
					t2 = 0;
					t3 = 0;
					break;
				case "H3":
					t2++;
					t3 = 0;
					while (level > 1) {
						contents += `</li></ul>`;
						level--;
					}
					level = 1;
					if (t2 == 1)
						contents += `<ul>`;
					else
						contents += `</li>`;
					contents += `<li><a href="#${pair.name}"><span class="tocno">${t1}.${t2} </span>${pair.text}</a>`;
					break;
				case "H4":
					t3++;
					level = 2;
					if (t3 == 1)
						contents += `<ul>`;
					else
						contents += `</li>`;
					contents += `<li><a href="#${pair.name}"><span class="tocno">${t1}.${t2}.${t3} </span>${pair.text}</a>`;
					break;
			}
		}
		while (level > 0) {
			contents += `</li></ul>`;
			level--;
		}
		if (t1 > 0)
			contents += `</li>`;
		contents += `</ul>`;
		toc.innerHTML = contents;
		console.log(contents);
	}

	if (toc == null)
		items.forEach(h => fix(h));
	else
		fixToc();

    if (location.hash.length > 0) {
    	let hash = location.hash;
    	location.hash = "";
    	location.hash = hash;
	}
	console.log("linkify end");
}

function getQueryArg(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return "";
}

// page ready function
$(function() {
	$.ajax({
		url: "?action=read-title",
		success: function (data)
		{
			title = data;
			getId("path").innerHTML = title;
			$.ajax({
				url: "?action=read-original",
				success: function (data)
				{
					original = data;
					$.ajax({
						url: "?action=read-content",
						success: function (data)
						{
							preview = data;
							if (title != document.title || original != preview)
								mode = "preview";
							updateEditorTools();
							linkify();
						    review = getQueryArg("method") ==  "review";
						    if (review) {
						    	filename = getQueryArg("filename");
						    	setTimeout(clickEdit, 1);
						    }
						}
					});
				}
			});
		}
	});
});
