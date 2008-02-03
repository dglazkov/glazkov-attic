
	function Sql() {
		
		this.open = function(name) {
			var db = google.gears.factory.create('beta.database', '1.0');
			db.open(name);
			this.db = db;
		}
				
		this.getLastInsertRowId = function() {
			return this.db && this.db.lastInsertRowId;
		}
		
		this.every = function(sql, callback, context) {
			var clean = true;
			this.forEach(sql, function(row) {
				if (!callback.call(this, row)) {
					clean = false;
				}
			}, context);
			return clean;
		}
		
		this.forEach = function(sql, callback, context) {
			this.some(sql, function(row) {
				callback.call(this, row);
			}, context);
		}
		
		this.execute = function(sql) {
			this.some(sql);
		}
		
		this.some = function(sql, callback, context) {
			var db = this.db;
			var me = this;
			if (db) {
				try {
					var rs = run_sql(this.db, sql);
					if (rs) {
						var result;
						if (callback) {
							context = context || this;
							var names = [];
							for(var i = 0; i < rs.fieldCount(); i++) {
								names[i] = rs.fieldName(i);
							}
							while(rs.isValidRow()) {
								var row = {};
								u.foreach(names, function(name) {
									row[name] = rs.fieldByName(name);
								});
								if (callback.call(context, row)) {
									result = true;
									break;
								}
								rs.next();
							}
						}
						rs.close();
						return result;
					}
				}
				catch(e) {
					rs && rs.close();
					report_error(e.message, e);
				}
			}
			report_error("Database is not connected. Is Gears installed?");
			
			function report_error(msg, e) {
				me.onerror && me.onerror(msg, e);
			}
			
			function run_sql(db, sql) {
				return sql && db && (typeof(sql) == "string" ? db.execute(sql) : (sql.sql && (sql.params.length ? db.execute(sql.sql, sql.params) : db.execute(sql.sql))));
			}			
		}
		
		this.close = function() {
			this.db && this.db.close();
		}
		
		this.prepare = function() {
			var params = u.map(arguments, function(n) { return n; });
			return { params: params, sql: params.shift() }
		}
		
	}
