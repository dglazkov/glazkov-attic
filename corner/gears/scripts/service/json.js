
	function Json(doc) {
		var head = doc && doc.getElementsByTagName("head")[0];
		var name = [ "___json_request", 0];
						
		var modifiers = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"" : "\\\"",
            "\\": "\\\\"
        };
	
		var handlers = {
			"string": function(s) {
				// this part lifted from json.org, ugly, rework later
				if (/["\\\x00-\x1f]/.test(s)) {
					return "\"" + s.replace(/[\x00-\x1f\\"]/g, function (a) {
						var c = modifiers[a];
						if (c) {
							return c;
						}
						c = a.charCodeAt();
						return "\\u00" +
							Math.floor(c / 16).toString(16) +
							(c % 16).toString(16);
					}) + "\"";
				}
				return "\"" + s + "\"";
			 },
			"function": function() { return "function() {}"; },
			"object": function(o) {
				if (o instanceof Array) {
					return "[" + u.map(o, function(o) { return serialize(o); }).join(",") + "]";
				}
				if (o instanceof Date) {
					return "new Date(\"" + o.toUTCString() + "\")";
				}
				var s = [];
				for(var k in o) {
					s.push("\"" + k + "\":" + serialize(o[k]));
				}
				return "{" + s.join(",") + "}"
			}
		}
		
		this.toJSONString = function(o) {
			return serialize(o);
		}
		
		this.parseJSON = function(s) {
			return eval("(" + s + ")");
		}
		
		this.makeJSONRequest = function(url, callback) {
			if (head) {
				var script;
				var name = getNextName();
				
				window[name] = function(o) {
					head.removeChild(script);
					callback(o);
				}
				
				var script = document.createElement("script");
				script.src = url.replace(/:json:/, name);
				head.appendChild(script);							
			}
		}
		
		function getNextName() {
			name[0]++;
			return name.join("_");
		}
		
		function serialize(o) {
			return o ? (handlers[typeof(o)] || String).call(this, o) : "null";
		}
	}
	
	