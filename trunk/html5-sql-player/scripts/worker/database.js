
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
	