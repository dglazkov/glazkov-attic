
	function SQLResultSetRowList(rows) {
		
		// TODO: Make read-only
		this.length = rows.length;
		
		this.item = function(i) {
			return rows[i];
		}
	};
