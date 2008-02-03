
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
