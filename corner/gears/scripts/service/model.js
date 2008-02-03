
	function Model() {
		var sql = new Sql();
		
		var sort_sql = {
			title: "order by title;",
			last_visited: "order by pages.created_on desc;",
			url: "order by url;"
		}
		
		this.open = function() {
			sql.open("ukmarks");
			sql.forEach("SELECT count(*) AS count FROM sqlite_master;", function(row) {
				if (row.count == 0) {
					sql.execute("CREATE TABLE pages ( url TEXT PRIMARY KEY, last_checked INTEGER, page_created INTEGER );");
					sql.execute("CREATE TABLE items ( typeid INTEGER, uid TEXT PRIMARY KEY, title TEXT, json TEXT, item_created INTEGER );");
					sql.execute("CREATE TABLE links ( pageid INTEGER, itemid INTEGER );");
					sql.execute("CREATE TABLE properties ( name TEXT PRIMARY KEY, value TEXT );");
				}
			}, this);
		}
		
		this.setOnError = function(handler) {
			sql.onerror = handler;
		}
		
		this.close = function() {
			sql.close();
		}
		
		this.addPage = function(url) {
			if (!sql.some(sql.prepare("SELECT * FROM pages WHERE url = ?", url), function(page) {
				return true;
			})) {
				sql.execute(sql.prepare("INSERT INTO pages VALUES(?,?,?)", url, 0, (new Date()).getTime()));
			}
		}
		
		this.forSortedItems = function(by, callback, context) {
			sql.forEach(create_sort_sql(by), callback, context);
		}
		
		this.forStalePages = function(callback, context) {
			sql.forEach(sql.prepare("select rowid, * from pages where last_checked < ?", (new Date()) - 604800000), callback, context);
		}
 		
		function create_sort_sql(by) {
			return sql.prepare("select url, typeid, last_checked, uid, title, json, page_created, item_created, pages.rowid from pages left join links on pages.rowid = links.pageid left join items on items.rowid = links.itemid " +
				(sort_sql[by] || ""));
		}
		
	}
	
	
	;// end
	