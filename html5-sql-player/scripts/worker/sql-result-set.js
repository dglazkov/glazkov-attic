
	function SQLResultSet(id, rows) {
		// TODO: Make read-only
		this.insertId = id;
		
		// TODO: Implement rowsAffected
		this.rowsAffected = 0;
		
		this.rows = rows;
	};