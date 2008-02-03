
	function Pipe(sends, handler) {
		
		Pipe.router || (Pipe.router = new Router());
		
		function Router() {
			var wp = google.gears.workerPool || google.gears.factory.create('beta.workerpool', '1.0');
			var pipes = [];
			wp.onmessage = function(a, b, msg) {
				var sender = msg.sender;
			}
			this.add = function(pipe) {
				pipes.push(pipe);
			}
		}
		
		var forEach = Array.forEach || function(a, func, cx) {
			cx || (cx = {});
			var l = a.length;
			for(var i = 0; i < l; i++) {
				func.call(cx, a[i], i, a);
			}
		}
	
		forEach(sends, function(send) {
			this[send] = function() {
				sendMessage(send, arguments);
			}
		}, this);
		
		var pipe = this;
		
		wp.onmessage = function(a, b, msg) {
			var l = msg.text.split(':');
			if (l.length) {
				var h = function() {
					this.sender = msg.sender;
					this.origin = msg.origin;
				};
				h.prototype = pipe;
				return (handler[l.shift()]||nil).apply(new h(), unmarshall(l));
			}
		}
		
		function sendMessage(cmd, args) {
			var a = [ escape(cmd) ];
			var sender;
			forEach(args, function(arg, i) {
				(i > 0 && a.push(atos(arg))) || (sender = arg);
			});
			wp.sendMessage(a.join(':'), sender);
		}
		
		function unmarshall(args) {
			var r = [];
			forEach(args, function(arg) {
				r.push(stoa(arg));
			})
			return r;
		}
				
		function isArray(a) {
			return a && (a.constructor === Array || a.callee);
		}
		
		function nil() {}
		
		function atos(a) {
			if (a) {
				if (isArray(a)) {
					var r = [ null ];
					forEach(a, function(item) {
						r.push(escape(item));
					});
					return r.join('|');
				}
				return escape(a);
			}
			return a;
		}
		
		function stoa(s) {
			if (s) {
				if (s.charAt(0) == '|') {
					var a = s.substring(1).split('|');
					var r = [];
					forEach(a, function(item) {
						r.push(unescape(item));
					})
					return r;
				}
				return unescape(s);
			}
			return s;
		}

	}
