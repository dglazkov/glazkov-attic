
	function SQLResultSetRowList() {
		
		// TODO: Make this.length read-only
		
		this.item = function(i) {
			return this[i];
		}
	};
