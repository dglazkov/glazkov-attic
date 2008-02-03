
	function Console(pipe, id) {
		var ms = [ 'log', 'info', 'warn', 'error', 'debug'];
		if (id == 0 || id) {
			id = parseInt(id);
			ms.push('database');
		}
		else id = pipe.sender;
		for(var i = 0; i < ms.length; i++) {
			var m = ms[i];
			this[m] = makeSend(m);
		}
		
		function makeSend(type) {
			return function() {
				pipe.report(id, type, arguments);
			}
		}
	}