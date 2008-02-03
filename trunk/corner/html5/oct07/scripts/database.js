
	function Database(r, n, v) {
		this.version = v;
		
		this.changeVersion = function(oldVersion, newVersion, callback, errorCallback) {
			// TODO: Implement changeVersion	
		}
		
		this.transaction = function(callback, errorCallback, successCallback) {
			// TODO: Complete conformance to processing model
			callback && window.setTimeout(function() {
				try {
					r.begin();
					callback(new Transaction(r, n));
					r.commit();
				}
				catch(e) {
					r.rollback();
					// TODO: Implement error code translation
					errorCallback && errorCallback(e);
					return;
				}
				successCallback && successCallback();
			}, 0);
		}
	};
	