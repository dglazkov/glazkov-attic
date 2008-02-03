
	function Database(r, n, v) {
		this.version = v;
		
		this.changeVersion = function(oldVersion, newVersion, callback) {
			// TODO: Implement changeVersion	
		}
		
		this.executeSql = function(sqlStatement, args, callback) {
			r.run(n, sqlStatement, args, callback);
			//var r = d.execute(sqlStatement, args);
			//if (r) {
			//	var names = [];
			//	for(var i = 0; i < r.fieldCount(); i++) {
			//		names[i] = r.fieldName(i);
			//	}
			//	var rows = [];
			//	while(r.isValidRow()) {
			//		var row = {};
			//		for(var i = 0; i < names.length; i++) {
			//			var name = names[i];
			//			row[name] = r.fieldByName(name);
			//		}
			//		rows.push(row);
			//		r.next();
			//	}
			//	r.close();
			//	callback(new SQLResultSet(d.lastInsertRowId, rows));
			//}
		}
		
		this.closeTransaction = function() {
			// TODO: Implement this
		}		
	};
	