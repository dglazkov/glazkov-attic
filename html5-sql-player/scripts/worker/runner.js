	
	var rid;

	function Runner(name, pipe, txid) {

		rid || (rid = google.gears.workerPool.createWorker([ worker, Console, Pipe, 'worker()' ].join(';')));
		
		this.begin = function() {
			pipe.begin(rid, name, pipe.sender, txid);
		}
		
		this.commit = function() {
			pipe.commit(rid, txid);
		}
		
		this.rollback = function() {
			pipe.rollback(rid, txid);
		}
		
		this.exec = function(tx, sqlStatement, args, callback, errorCallback, txErrorCallback) {
			var me = this;
			var cid = callbacks.push({ tx: tx, callback: callback, errorCallback: errorCallback, txErrorCallback: txErrorCallback }) - 1;
			pipe.execute(rid, cid, sqlStatement, args, txid);
		}
		
		function worker() {
			var databases = {};
			var console;
			var queue = [];
			var next;
			new Pipe(google.gears.workerPool, [ 'results', 'error', 'report' ], {
				begin: function(name, consoleId, txid) {
					console = new Console(this, consoleId);
					try {
						var d = databases[txid] = google.gears.factory.create('beta.database', '1.0');
						d.open(name);
						dbexec(d, 'BEGIN IMMEDIATE');
						next = false;
					}
					catch(e) {
						this.error(this.sender, -1, e.message, txid);
					}
				},
				execute: function(cid, sql, args, txid) {
					var d = databases[txid];
					if (d) {
						var pipe = this;
						var action = function() {
							try {
								var r = dbexec(d, sql, args || []);
								var lid = d.lastInsertRowId;
								if (r) {
									var names = [];
									var data = [];
									for(var i = 0; i < r.fieldCount(); i++) {
										names.push(r.fieldName(i));
									}
									while(r.isValidRow()) {
										for(var i = 0; i < names.length; i++) {
											data.push(r.field(i));
										}
										r.next();
									}
									r.close();
								}
								pipe.results(pipe.sender, cid, names, data, lid, txid);
							}
							catch(e) {
								pipe.error(pipe.sender, cid, e.message, txid);
								r && r.close();
							}
						}
						if (next) {
							queue.push(action);
						}
						else {
							next = true;
							action();
						}
					}
				},
				next: function(txid) {
					var d = databases[txid];
					d && (queue.shift() || nil)();
				},
				rollback: function(txid) {
					var d = databases[txid];
					if (d) {
						try {
							dbexec(d, 'ROLLBACK');
						}
						catch(e) {
							// intentionally left blank
						}
						d.close();
						databases[txid] = d = null;
						queue = [];
					}
				},
				commit: function(txid) {
					var d = databases[txid];
					if (d) {
						var action = function() {
							dbexec(d, 'COMMIT');
							d.close();
							databases[txid] = d = null;
						};
						next ? queue.push(action) : action();
					}
				}
			});

			function dbexec(d, sql, args) {
				console.database(sql);
				return d.execute(sql, args);
			}
			
			function nil() {}
		}
		
	}