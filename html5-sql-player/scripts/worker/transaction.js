
	function Transaction(r, txErrorCallback, txid) {
		
		this.executeSql = function(sqlStatement, args, callback, errorCallback) {
			r.exec(this, sqlStatement, args, callback, errorCallback, txErrorCallback, txid);
		}
	}
