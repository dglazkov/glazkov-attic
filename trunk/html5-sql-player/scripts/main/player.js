
	function Player(url) {
		var wp;
		var id;
		
		try {
			wp = google.gears.factory.create("beta.workerpool", "1.0");
		}
		catch(e) {
			// TODO: Handle errors better
			return;
		}
		
		var me = this;
		var pipe = new Pipe(wp, [ 'bind', 'play' ], {
			report: function() {
				me.onmessage && me.onmessage.apply(me, arguments);
			}
		});
		
		try {
			id = wp.createWorkerFromUrl(url);
		}
		catch(e) {
			// TODO: Handle errors better than this
			return;
		}
		
		pipe.bind(id);
				
		this.play = function(code) {
			pipe.play(id, code);
		}
	}