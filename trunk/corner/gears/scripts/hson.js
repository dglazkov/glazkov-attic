
	
	function Hson() {
		this.encode = function(a) {
			return u.map(a, function(i) { return escape(i); }).join(" ");
		}
		
		this.decode = function(s) {
			return u.map(s.split(" "), function(i) { return unescape(i); });
		}
	}