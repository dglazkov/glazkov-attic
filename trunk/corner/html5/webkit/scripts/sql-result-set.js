
	function SQLResultSet(id, rows) {
		this.insertId = id;
		// TODO: Implement:
		// this.rowsAffected
		// this.errorCode
		// this.error
		
		this.rows = new SQLResultSetRowList(rows);
	};