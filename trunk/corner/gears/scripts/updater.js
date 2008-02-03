
	function Updater() {
		
		this.start = function() {
			
			try {
				var wp = google.gears.factory.create("beta.workerpool", "1.0");
			}
			catch(e) {
				return;
			}
			
			wp.onmessage = function(message, id, o) {
				console.log("message", json.parseJSON(message), id, o);			
			}
			
			var id;
			try {
				id = wp.createWorker(String(worker) + String(Model) + String(Sql) + String(Utils) + String(Json) +  ";worker(this);");
			}
			catch(e) {
				return;
			}
			this.wp = wp;
			this.id = id;
			
			wp.sendMessage("start", id);
		}
			
		function worker(o) {
			o.model = new Model();
			o.u = new Utils();
			o.json = new Json();
			var count = 0;
			var pages;
			
			var parentId;
			
			var tasks = {
				start: function() {
					model.open();
					model.setOnerror = function(e) {
						sendError(e);
						return;
					}
					pages = [];
					model.forStalePages(function(page) {
						pages.push({ id: page.rowid, url: page.url });
					})
					model.close();
					return createMessage();
				},
				next: function() {
					count++;
					return createMessage();
				},
				reset: function() {
					count = 0;
				},
				ignore: function() {}
			}
			
			gearsWorkerPool.onmessage = function(message, id) {
				try {
					var response = (tasks[message] || tasks.ignore)();
					if (response) {
						gearsWorkerPool.sendMessage(json.toJSONString(response), 0);
					}
				}
				catch(e) {
					sendError(e);
				}
			}
			
			function loadPages() {
				
			}
			
			function createMessage() {
				return count >= (pages.length - 1) ? [ "end" ] : [ "more", pages[count] ];
			}
			
			function sendError(e) {
				gearsWorkerPool.sendMessage(json.toJSONString([ "error", e ]), 0);
			}
		}
			
		this.restart = function() {
			var wp = this.wp;
			if (wp) {
				wp.sendMessage("stale", this.id);
			}
		}

		function import_page() {
			var url = this.view.areas.url.value;
			var head = this.view.head;
			var me = this;
			
			window.json = function(o) {
				var model = me.model;
				console.log("payload received:", o);
				if (o.from && o.hcalendar) {
					var pageid;
					model.forEach(new Sql("SELECT rowid FROM pages WHERE url = ?", o.from), function(page) {
						pageid = page.rowid;
					});
					console.log("pageid", pageid);
					var timestamp = (new Date()).getTime();
					if (pageid) {
						model.execute(new Sql("UPDATE pages SET last_visited = ? WHERE rowid = ?", timestamp, pageid));
						// instead of deleting everything, synchronize
						// - load all items for the page
						//model.execute(new Sql("DELETE FROM items WHERE pageid = ?", pageid));
					}
					else {
						model.execute(new Sql("INSERT INTO pages VALUES(?,?)", url, timestamp));
						pageid = model.getLastInsertRowId();
					}
					u.foreach(o.hcalendar instanceof Array ? o.hcalendar : [ o.hcalendar ], function(cal) {
						console.log("cal", cal);
						model.execute(new Sql("INSERT INTO items VALUES(1, ?, ?, ?, ?)", cal.url, cal.summary, new Json(cal), timestamp));
						model.execute(new Sql("INSERT INTO links VALUES(?, ?)", pageid, model.getLastInsertRowId()));
					})
				}
				head.removeChild(script);
				me.sort();
				window.json = null;
			}
			
			var script = document.createElement("script");
			script.src = "http://microformatique.com/optimus/?uri=" + escape(url) + "&format=json&function=json&filter=hcalendar";
			head.appendChild(script);
		}

	}
	
	