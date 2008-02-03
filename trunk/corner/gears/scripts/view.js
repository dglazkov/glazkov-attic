
	function View() {
		
	}
	
	View.frame = [
		"<div id='canvas'>",
			"<div id='import'><input type='text' id='url' /><button onclick='c.addPage()'>Add Page</button></div>",
			"<div id='auth'></div>",
			"<div id='sorter'>",
				"<ul>",
					"<li><a href='' onclick='return c.sort(\"url\")'>URL</a></li>",
					"<li><a href='' onclick='return c.sort(\"page_created\")'>Date Added</a></li>",
				"</ul>",
			"</div>",
			"<div id='data'>Start adding data by importing some URLs</div>",
		"</div>"
	].join("");
	
	View.div_frame = [
		"<div class='", null, "'>",
			null,
		"</div>"
	];
	
	View.no_filter = function(s) { return s; }
	
	View.date_filter = function(d) { return new DateHelper(d).getFriendly(); }
	
	View.create_pretty_date = function(d) {
		var h = new DateHelper(d);
		return "<span class='relative'>" + h.getRelative() + "</span> <span class='absolute'>(" + h.getFriendlyDate() + ")</span>"
	}
	
	View.event_fields = [
		[ "dtstart", View.date_filter],
		[ "dtend", View.date_filter],
		[ "description", View.no_filter ],
		[ "location", View.no_filter ]
	];
	
	View.prototype.create = function() {
		var b = document.body;
		b.innerHTML =  View.frame;
		this.areas = [];
		u.foreach(['import', 'url', 'auth', 'sorter', 'data'], function(id) {
			this.areas[id] = document.getElementById(id);
		}, this);
		this.head = document.getElementsByTagName("head")[0];
	}
	
	View.prototype.push = function(area, title, bind) {
		var a = this.areas[area];
		if (a) {
			var item = a.appendChild(document.createElement("li"));
			item.innerHTML = title;
			bind && bind(item);
		}
	}
	
	View.prototype.startGroup = function(title, by) {
		var data = this.areas.data;
		var group = data.appendChild(document.createElement("div"));
		group.className = "group";
		View.div_frame[1] = "title";
		View.div_frame[3] = by == "page_created" ? View.create_pretty_date(title) : title;
		group.innerHTML = View.div_frame.join("");
		var items = group.appendChild(document.createElement("ul"));
		this.items = items;
	}
	
	View.prototype.endGroup = function() {
		this.items = null;
	}
	
	View.prototype.renderItem = function(item, by) {
		var items = this.items;
		if (items) {
			var html = [];
			console.debug(item);
			html.push("<a href='" + item.url + "'>" + item.url + "</a>");
			if (item.typeid == 1) {
				var o = eval("(" + item.json + ")");
				html.push(u.map(View.event_fields, function(n) {
					var v = o[n[0]];
					if (v && v != "Invalid Date") {
						View.div_frame[1] = n;
						View.div_frame[3] = n[1](v);
						return View.div_frame.join("");
					}
					return "";
				}).join(""));
			}
			var node = items.appendChild(document.createElement("li"));
			node.innerHTML = html.join("");
		}
	}
	
	View.prototype.clear = function(area) {
		var a = this.areas[area];
		a && (a.innerHTML = "");
	}
	
	View.prototype.bind = function(area, n, bind) {
		var a = this.areas[area];
		a && (a["on" + n] = bind);
	}
	
	; // i like semicolons