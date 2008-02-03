
	var u = {
		seek_pattern: [ ".//", "", "[@", "", "='", "", "']" ],
		foreach: Array.forEach || function() {
			// to be implemented
		},
		map: Array.map || function() {
			// to be implemented
		},
		first: function(c) {
			return c && (c.length == 0 ? null : (c.length ? c[0] : c));
		},
		
		// todo: make work with multiple classes
		select: document.evaluate ? function(node, value, element, attribute) {
			this.seek_pattern[1] = element || "*";
			this.seek_pattern[3] = attribute || "class";
			this.seek_pattern[5] = value || "";
			var s = document.evaluate(this.seek_pattern.join(""), node, null, 5, null);
			var r = [];
			var v;
			while(v = s.iterateNext()) {
				r.push(v);
			}
			return r;
		}: function(element, attr, value) {
			// classic, to be implemented
		}
	};