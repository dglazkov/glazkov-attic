
	function Runner() {
		var callbacks = [];
		var wp;
		var id;
			
		try {
			wp = google.gears.factory.create("beta.workerpool", "1.0");
		}
		catch(e) {
			return;
		}
		
		wp.onmessage = function(msg, srcId) {
			if (srcId == id) {
				var l = msg.split(":");
				if (l.length >= 4) {
					var cid = l[0];
					var cbo = callbacks[cid];
					if (cbo) {
						var names = l[1].split("|");
						var data = l[2].split("|");
						var ccnt = names.length;
						var rows = [];
						for(var r = 0; r < data.length; r+=ccnt) {
							var row = {};
							for(var c = 0; c < ccnt; c++) {
								row[unescape(names[c])] = unescape(data[r + c]);
							}
							rows.push(row);
						}
						var callback = cbo.callback;
						callback && callback(cbo.tx, new SQLResultSet(l[3], rows));
						callbacks[cid] = null;
					}
				}
				else {
					// TODO: Pass error messages to error callback
				}
			}
		}
		
		try {
			id = wp.createWorker(String(worker) + ";worker();");
		}
		catch(e) {
			return;
		}
		
		this.begin = function() {
			
		}
		
		this.commit = function() {
			
		}
		
		this.run = function(tx, d, sql, args, callback, errorCallback) {
			// TODO: follow http://www.whatwg.org/specs/web-apps/current-work/multipage/section-sql.html#executesql
			// 		currently, only last step is implemented
			
			// TODO: Not supposed to run anything, just queue up and exit
			// TODO: Implement storing tx and errorCallback w/callbacks

			callbacks.push({ callback: callback, errorCallback: errorCallback, tx: tx });
			// request message format:
			// callbackId:databaseName:sql:argument|argument|argument
			var msg = [];
			msg.push(callbacks.length - 1);
			msg.push(escape(d));
			msg.push(escape(sql));
			var eargs = [];
			for(var i = 0; i < args.length; i++) {
				eargs.push(escape(args[i]));
			}
			msg.push(eargs.join("|"));
			wp.sendMessage(msg.join(":"), id);
		}
		
		function worker() {
			gearsWorkerPool.onmessage = function(msg, id) {
				var l = msg.split(":");
				if (l.length >= 4) {
					var d = gearsFactory.create("beta.database", "1.0");
					d.open(unescape(l[1]));
					var names = [];
					var data = [];
					var eargs = l[3].split("|");
					var args = [];
					if (eargs.length > 1 || eargs[0]) {
						for(var i = 0; i < eargs.length; i++) {
							args.push(unescape(eargs[i]));
						}
					}
					try {
						var r = d.execute(unescape(l[2]), args);
						var lid = d.lastInsertRowId;
						if (r) {
							for(var i = 0; i < r.fieldCount(); i++) {
								names.push(escape(r.fieldName(i)));
							}
							while(r.isValidRow()) {
								for(var i = 0; i < names.length; i++) {
									data.push(escape(r.field(i)));
								}
								r.next();
							}
							r.close();
						}
						// response message format:
						// callbackId:name|name|..|name:data|data|data:lastInsertRowId
						l[1] = names.join("|");
						l[2] = data.join("|");
						l[3] = lid;
						gearsWorkerPool.sendMessage(l.join(":"), id);
					}
					catch(e) {
						// error response format:
						// callbackId:message
						... continue here;
						gearsWorkerPool.sendMessage( + ":" + escape(e.message), id);
						r && r.close();
					}
					d.close();
					return;
				}
				gearsWorkerPool.sendMessage("invalid+message+format", id);
			}
		}
	}