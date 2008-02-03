
	function Transaction(r, n) {
		
		this.executeSql = function(sqlStatement, args, callback, errorCallback) {
			r.run(this, n, sqlStatement, args, callback, errorCallback);
		}
		
		
	}
