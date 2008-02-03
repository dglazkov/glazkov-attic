// Google Reader Gears Search
// version 0.130
// 09/06/2007
// Copyright (c) 2007, Raul Ochoa <rochoaf@gmail.com>
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
//-----------------------------------------------------------------------------
//
// CHANGELOG:
//
//	# 0.130 - 06/08/2007
//		* UI redone.
//		* Fixed some bugs.
//		* Special thanks go to:
//			- Marcin Jaworski, about the _USER_ID issue.
//			- San Angove (http://rephrase.net/), about function.toString().
//
//	# 0.120 - 11/06/2007
//		* Added pagination feature. Loading big resultsets was too slow.
//
//	# 0.101 - 11/06/2007
//		* Element summary is not alway available
//		  now it is sorounded by a try-catch.
//
//	# 0.100 - 10/06/2007
//		* First Version
//
// ----------------------------------------------------------------------------
//
// This is a Greasemonkey user script.
//
// To install, you need Greasemonkey: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
//
// To uninstall, go to Tools/Manage User Scripts,
// select "Google Reader Gears Search", and click Uninstall.
//
// ----------------------------------------------------------------------------
//
// ==UserScript==
// @name Google Reader Gears Search
// @namespace http://rau1.com/dl/grgs.user.js
// @description Search Google Reader items using Google Gears.
// @include http://www.google.com/reader/view/*
// @include https://www.google.com/reader/view/*
// ==/UserScript==

// CSS Style
var style = document.createElement("style");
	style.type = "text/css";
	// Credits go to Mark James (http:/famfamfam.com/)
	style.innerHTML = '#gears-search {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIlSURBVDjLY/j//z8DJZiB6gY09895tGTDnv+tE+f+B/EnL1gHZofGpt4iyoCK5r5H63YcBmkAG5BRVPO/b/aK/0CDn+A1ICm75H/X9CX/azun/m+bNP+/iaUd2AAHN5//WSV1/wuqWsFiVvauyxWUVHkEhUWZwAYsWLOTo6i23aOpbzbYqYXVbf89/MP+u3gF/M8pa/gfm5b3PyKn6X/txGX/S1qmgOW4uXmq2NjZGcEGTJi7mmXKwvUPF63b9T+3vAmMqyeu+j9l+a7/fUu2/2qcvuF/be/8/9G5zf/DkwvBLmRmYXnAwMDADDYA6FxWkM3TFm/8n11a/x/k55Tc8v/RyTn/1bT0wDaCXAITj0svAOpi+AfErGAD0goqWf1CY35a2Dr99wqM+G9sYftfW9/4v6yC8lMRMXEDSRm5rWISUv+B/v4vKi75n5eP/z8jI+M7oAFM8ED0CYo6DAq4XYfP/F+15cD/7hnLQAG2AiSnqqmzorJlwv+1Ow6B5UAxwscveBglFtx8gv/kVzSDDQC66H98RuF/PWPzqyA5oM1XQTEAMiA1v+J/emH1fw5Orj8oBji6+/6HGQBTpKGt/1NRRZ1RQlr2HSjgYAaAwoKVle0/igHWjm7geAYlIJACUGDqGpn9B/qfX0lV4wrIAFAsweSAYYBqACiBGJhYggMP6Of/QJv/S8sq/AcGohTQv7c5ubj/A+MdFH2gGABj2mUmUjEAnjJojQ5aPHUAAAAASUVORK5CYII="); position: absolute; top: 17px; left: 258px; margin: 0; background-repeat: no-repeat; padding-left: 20px; background-position: 2px;}';
document.getElementsByTagName('head')[0].appendChild(style);

	
// Search UI
var container = document.createElement("div");
	container.id = "gears-search";
	
var form = document.createElement("form");
	form.setAttribute('onsubmit', 'gearsSearch(0); return false;');
		
var queryBox = document.createElement("input");
    queryBox.id = 'gearsQuery';
    form.appendChild(queryBox);

var searchButtom = document.createElement("button");
    searchButtom.setAttribute('style','margin-left: 5px;');
    searchButtom.setAttribute('onclick','gearsSearch(0)');
	searchButtom.appendChild(document.createTextNode("Gears Search"));
	form.appendChild(searchButtom);

	container.appendChild(form);
	
document.getElementsByTagName("body")[0].insertBefore(container, document.getElementById("global-info"));


// Check the user went offline
function userWentOffline(){
	try {
		var table_exists = grgsdb.execute("SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'items'");
		if (table_exists.isValidRow()) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		throw new Error(e.message);
	}
}

var userWentOfflineJS = document.createElement("script");
	userWentOfflineJS.type = "text/javascript";
	userWentOfflineJS.innerHTML = userWentOffline.toString();
document.getElementsByTagName('head')[0].appendChild(userWentOfflineJS);


// Gears Init
var gearsInitJS = document.createElement("script");
	gearsInitJS.type = "text/javascript";
	gearsInitJS.setAttribute('src', 'http://code.google.com/apis/gears/tools/gears_init.js');
document.getElementsByTagName('head')[0].appendChild(gearsInitJS);

// Gears Search
var gearsSearchJS = document.createElement("script");
	gearsSearchJS.type = "text/javascript";
	
	function init() {
		if (!window.google || !google.gears) {
			return;
		}

		try {
			grgsdb = google.gears.factory.create('beta.database', '1.0');
		} catch (ex) {
			setError('Could not create database: ' + ex.message);
		}

		if (grgsdb) {
			grgsdb.open(dbname);
		}
	}
	
	function gearsSearch(offset) {
		if (!userWentOffline()) {
			alert("You haven't gone offline yet. Please go offline mode at least once.");
		} else {	
			document.getElementById('loading-area').setAttribute('class', '');
			var q = document.getElementById('gearsQuery').value;
			try {
				var rs = grgsdb.execute("select * from items where xml like '%" + q + "%' LIMIT " + offset + ", 10");
				document.getElementById('viewer-page-container').setAttribute('class', 'hidden');
				document.getElementById('viewer-box').setAttribute('class', '');
				document.getElementById('viewer-top-links').setAttribute('class', 'hidden');
				document.getElementById('viewer-controls-container').setAttribute('class', '');
				document.getElementById('viewer-header').setAttribute('class', '');
				document.getElementById('chrome-stream-title').innerHTML = 'Gears Search';
				document.getElementById('entries').innerHTML = '';
				var i = 0;
				while (rs.isValidRow()) {
					document.getElementById('entries').innerHTML += parseItem(rs.fieldByName('xml'));
					i++;
					rs.next();
				}
				if (i==0) {
					document.getElementById('entries').innerHTML += '<h2 style="text-align: center;">There are no results for your search</h2>';
				}
				document.getElementById('viewer-controls-container').innerHTML = '';
				if (offset > 9) {
					document.getElementById('viewer-controls-container').innerHTML += '<table cellspacing="0" cellpadding="0" border="0" class="round-box unselectable tab-header"><tbody><tr><td class="s tl"/><td class="s"/><td class="s tr"/></tr><tr><td class="s"/><td class="c" onclick="gearsSearch(' + offset + '- 10); return false;">Previous results</td><td class="s"/></tr><tr><td class="s bl sq"/><td class="s"/><td class="s br sq"/></tr></tbody></table>';
				}
				if (i>9) {
					document.getElementById('viewer-controls-container').innerHTML += '<table cellspacing="0" cellpadding="0" border="0" class="round-box unselectable tab-header"><tbody><tr><td class="s tl"/><td class="s"/><td class="s tr"/></tr><tr><td class="s"/><td class="c" onclick="gearsSearch(' + offset + '+ 10); return false;">Next results</td><td class="s"/></tr><tr><td class="s bl sq"/><td class="s"/><td class="s br sq"/></tr></tbody></table>';
				}
				rs.close();
				document.getElementById('loading-area').setAttribute('class', 'hidden');
			} catch (e) {
				throw new Error(e.message);
			}
		}
	}
	
	gearsSearchJS.innerHTML = ""+
	"var dbname = 'GR-' + parseInt(_USER_ID, 10).toString(16);"+"\r\n"+
	"var grgsdb;"+"\r\n"+
	init.toString() +"\r\n"+
	"init();"+"\r\n"+
	gearsSearch.toString();
	
document.getElementsByTagName('head')[0].appendChild(gearsSearchJS);


// Feed Item Parser
var parser = document.createElement("script");
	parser.type = "text/javascript";

	function parseItem(xml) {
		var xmlobject = (new DOMParser()).parseFromString(xml, 'text/xml');
		var title = xmlobject.documentElement.getElementsByTagName('title')[0].childNodes[0].nodeValue;
		var url = xmlobject.documentElement.getElementsByTagName('id')[0].getAttribute('gr:original-id');
		try{
			var summary = xmlobject.documentElement.getElementsByTagName('summary')[0].childNodes[0].nodeValue;
		} catch (e) {
			var summary = '';
		}
		var source = xmlobject.documentElement.getElementsByTagName('source')[0];
		var sourcetitle = source.getElementsByTagName('title')[0].childNodes[0].nodeValue;
		var sourcefeed = source.getAttribute('gr:stream-id');
		var datetime = xmlobject.documentElement.getElementsByTagName('updated')[0].childNodes[0].nodeValue;

		var html = '\r\n'+
			'<div class="entry read read-state-locked overflow-settable" id="current-entry">'+'\r\n'+
		'	<table class="card">'+'\r\n'+
		'		<tbody class="card-tbody">'+'\r\n'+
		'			<tr>'+'\r\n'+
		'				<td class="ctl"/>'+'\r\n'+
		'				<td class="ct"/>'+'\r\n'+
		'				<td class="ctr"/>'+'\r\n'+
		'			</tr>'+'\r\n'+
		'			<tr>'+'\r\n'+
		'				<td class="cl"/>'+'\r\n'+
		'				<td class="cc">'+'\r\n'+
		'					<div class="entry-container">'+'\r\n'+
		'						<div class="entry-main">'+'\r\n'+
		'							<div title="' + datetime + '" class="entry-date">' + datetime + '</div>'+'\r\n'+
		'							<h2 class="entry-title"><a href="' + url + '" target="_blank" class="entry-title-link">' + title + '<img width="18" height="18" class="entry-title-go-to" src="/reader/ui/1416249330-go-to.gif"/></a></h2>'+'\r\n'+
		'						<div class="entry-author">'+'\r\n'+
		'							<span class="entry-source-title-parent">from <a target="_blank" class="entry-source-title" href="/reader/view/feed/' + sourcefeed + '">' + sourcetitle + '</a></span>'+'\r\n'+
		'						</div>'+'\r\n'+
		'						<div class="entry-body">'+'\r\n'+
		'							<div id="">'+'\r\n'+
		'								<ins class="item-body">'+'\r\n'+
		'									<div>' + summary + '</div>'+'\r\n'+
		'								</ins>'+'\r\n'+
		'								</div>'+'\r\n'+
		'							</div>'+'\r\n'+
		'						</div>'+'\r\n'+
		'					</div>'+'\r\n'+
		'				</td>'+'\r\n'+
		'				<td class="cr"/>'+'\r\n'+
		'			</tr>'+'\r\n'+
		'			<tr class="card-actionrow">'+'\r\n'+
		'				<td class="cal"/>'+'\r\n'+
		'				<td class="ca"/>'+'\r\n'+
		'				<td class="car"/>'+'\r\n'+
		'			</tr>'+'\r\n'+
		'			<tr class="card-bottomrow">'+'\r\n'+
		'				<td class="cbl"> </td>'+'\r\n'+
		'				<td class="cb"> </td>'+'\r\n'+
		'				<td class="cbr"> </td>'+'\r\n'+
		'			</tr>'+'\r\n'+
		'		</tbody>'+'\r\n'+
		'	</table>'
		'</div>';

		return html;
	}
	
	parser.innerHTML = parseItem.toString();

document.getElementsByTagName('head')[0].appendChild(parser);