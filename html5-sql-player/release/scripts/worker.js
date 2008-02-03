new function() {


// ********
// console.js


	function Console(pipe, id) {
		var ms = [ 'log', 'info', 'warn', 'error', 'debug'];
		if (id == 0 || id) {
			id = parseInt(id);
			ms.push('database');
		}
		else id = pipe.sender;
		for(var i = 0; i < ms.length; i++) {
			var m = ms[i];
			this[m] = makeSend(m);
		}
		
		function makeSend(type) {
			return function() {
				pipe.report(id, type, arguments);
			}
		}
	}
// ********
// database.js


	var txCount = 0;

	function Database(name, version, displayName, estSize, pipe) {
		// TODO: should be read-only
		this.version = version;
		
		this.changeVersion = function(oldVersion, newVersion, callback, errorCallback) {
			// TODO: Implement changeVersion	
		}
		
		this.transaction = function(callback, errorCallback, successCallback) {
			var txid = txCount++;
			callback && SQLUtils.runAsync(function() {
				var r = new Runner(name, pipe, txid);
				var t = new Transaction(r, errorCallback);
				try {
					r.begin();
					callback(t);
					r.commit();
				}
				catch(e) {
					r.rollback();
					// TODO: Implement error code translation
					errorCallback && errorCallback(new SQLError(0, e.message));
					return;
				}
				successCallback && successCallback(t);
			});
		}
	};
	
// ********
// pipe.js


	function Pipe(wp, sends, handler) {
		
		var forEach = Array.forEach || function(a, func, cx) {
			for(var i = 0; i < a.length; i++) {
				func.call(cx || {}, a[i], i, a);
			}
		}
	
		forEach(sends, function(send) {
			this[send] = function() {
				sendMessage(send, arguments);
			}
		}, this);
		
		var pipe = this;
		
		wp.onmessage = function(a, b, msg) {
			var l = msg.text.split(':');
			if (l.length) {
				var h = function() {
					this.sender = msg.sender;
					this.origin = msg.origin;
				};
				h.prototype = pipe;
				return (handler[l.shift()]||nil).apply(new h(), unmarshall(l));
			}
		}
		
		function sendMessage(cmd, args) {
			var a = [ escape(cmd) ];
			var sender;
			forEach(args, function(arg, i) {
				(i > 0 && a.push(atos(arg))) || (sender = arg);
			});
			wp.sendMessage(a.join(':'), sender);
		}
		
		function unmarshall(args) {
			var r = [];
			forEach(args, function(arg) {
				r.push(stoa(arg));
			})
			return r;
		}
				
		function isArray(a) {
			return a && (a.constructor === Array || a.callee);
		}
		
		function nil() {}
		
		function atos(a) {
			if (a) {
				if (isArray(a)) {
					var r = [ null ];
					forEach(a, function(item) {
						r.push(escape(item));
					});
					return r.join('|');
				}
				return escape(a);
			}
			return a;
		}
		
		function stoa(s) {
			if (s) {
				if (s.charAt(0) == '|') {
					var a = s.substring(1).split('|');
					var r = [];
					forEach(a, function(item) {
						r.push(unescape(item));
					})
					return r;
				}
				return unescape(s);
			}
			return s;
		}

	}

// ********
// queue.js


	function Queue() {
		var waiting = [];
		var cursor = 0;
		var busy;
		var dead;
		var me = this;
		
		var timer = google.gears.factory.create("beta.timer", "1.0");
		
		this.queue = function(func) {
			if (!dead) {
				waiting.push(func);
				timer.setTimeout(process, 0);
			}
		}
		
		this.clear = function() {
			dead = true;
			cursor = waiting.length;
			busy = false;
		}
		
		function process() {
			if (!busy) {
				var l = waiting.length;
				if (cursor < l) {
					busy = true;
					waiting[cursor++]();
					busy = false;
				}
			}
			else {
				timer.setTimeout(process, 100);
			}
		}
		
	}
// ********
// runner.js

	
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
// ********
// sql-error.js


	function SQLError(code, message) {
		// TODO: Make read-only
		this.code = code;
		// TODO: Make read-only
		this.message = message;
	}
// ********
// sql-result-set.js


	function SQLResultSet(id, rows) {
		// TODO: Make read-only
		this.insertId = id;
		
		// TODO: Implement rowsAffected
		this.rowsAffected = 0;
		
		this.rows = rows;
	};
// ********
// sql-result-set-row-list.js


	function SQLResultSetRowList() {
		
		// TODO: Make this.length read-only
		
		this.item = function(i) {
			return this[i];
		}
	};

// ********
// sql-utils.js


	SQLUtils = {
		versionMatches: function(name, version) {
			// TODO: Implement version matching
			return !version;
		},
		runAsync: function(func) {
			google.gears.factory.create("beta.timer", "1.0").setTimeout(func, 0);
		},
		errors: {
			versionMismatch: 'Version Mismatch'
		}
	}

// ********
// transaction.js


	function Transaction(r, txErrorCallback, txid) {
		
		this.executeSql = function(sqlStatement, args, callback, errorCallback) {
			r.exec(this, sqlStatement, args, callback, errorCallback, txErrorCallback, txid);
		}
	}

// ********
// ~init.js


	var callbacks = [];
	

	new Pipe(google.gears.workerPool, [ 'report', 'begin', 'rollback', 'execute', 'next', 'commit' ], {
		bind: function() {
			// TODO: register sender as player
		},
		error: function(cid, text, txid) { // error from sql worker
			var co = callbacks[cid] || {};
			var error = new SQLError(0, text);
			if (!co.errorCallback || co.errorCallback(error)) {
				this.rollback(this.sender, txid);
				try {
					co.txErrorCallback && co.txErrorCallback(error);
				}
				catch(e) {
					// intentionally left blank
				}
				return;
			}
			this.next(this.sender, txid);
			callbacks[cid] = null;
		},
		results: function(cid, names, data, lid, txid) { // result from sql worker
			var co = callbacks[cid] || {};
			callbacks[cid] = null;
			var ccnt = names.length;
			var rc = 0;
			var rows = new SQLResultSetRowList();
			for(var r = 0; r < data.length; r+=ccnt) {
				var row = {};
				for(var c = 0; c < ccnt; c++) {
					row[unescape(names[c])] = unescape(data[r + c]);
				}
				rows[rc++] = row;
			}
			rows.length = rc;
			try {
				co.callback && co.callback(co.tx, new SQLResultSet(lid, rows));
			}
			catch(e) {
				this.rollback(this.sender, txid);
				try {
					var error = new SQLError(0, text);
					co.txErrorCallback && co.txErrorCallback(error);
				}
				catch(e) {
					// intentionally left blank
				}
				return;
			}
			this.next(this.sender, txid);
		},
		play: function(code) {
			var pipe = this;
			var console = new Console(pipe);
			var openDatabase = function(name, version, displayName, estSize) {
				if (!SQLUtils.versionMatches(name, version)) {
					throw { message: SQLUtils.errors.versionMismatch };
				}
				return new Database(name, version, displayName, estSize, pipe);
			}
			var window = { openDatabase : openDatabase, console: console, code: code };
			try {
				(function(){
					var google;var gearsFactory;var gearsWorkerPool;var pipe;var callbacks;var rid;var txCount;
					var Console;var SQLUtils;var Runner;var Pipe;
					eval(code);
				}).apply({});
			}
			catch(e) {
				console.error(e.message);
			}
			
		}
	});


}