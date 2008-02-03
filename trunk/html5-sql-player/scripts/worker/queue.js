
	function Queue() {
		var waiting = [];
		var cursor = 0;
		var busy;
		var dead;
		var me = this;
		
		var timer = google.gears.factory.create("beta.timer", "1.0");
		
		this.queue = function(func) {
			if (!dead) {
				waiting.push(func);
				timer.setTimeout(process, 0);
			}
		}
		
		this.clear = function() {
			dead = true;
			cursor = waiting.length;
			busy = false;
		}
		
		function process() {
			if (!busy) {
				var l = waiting.length;
				if (cursor < l) {
					busy = true;
					waiting[cursor++]();
					busy = false;
				}
			}
			else {
				timer.setTimeout(process, 100);
			}
		}
		
	}