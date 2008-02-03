
	(function() {
		var fired;
		var safari = /WebKit/i.test(navigator.userAgent);
		
		if (document.addEventListener && !safari) {
			document.addEventListener('DOMContentLoaded', fire, false);
		} else {
			// Dean Edwards (http://dean.edwards.name/)
			/*@cc_on @*/
			/*@if (@_win32)
				document.write('<script id=__ie_onload defer src=//:><\/script>');
				var script = document.getElementById('__ie_onload');
				script.onreadystatechange = function() { this.readyState == 'complete' && fire(); }
			@else */
			wait(30000, 100)
			/*@end @*/
		}
		
		function fire() {
			fired = true;
			init();
		}
	
		function wait(timeout, delta) {
			if (window.webroot != 'yes') {
				var interval = window.setInterval(function() {
					if (fired) {
						window.clearInterval(interval);
						// John Resig via Dean Edwards (http://dean.edwards.name/)
					} else if ((safari && /loaded|complete/.test(document.readyState))||timeout < 0) {
						window.setTimeout(fire, 0);
					}
					timeout -= delta;
					
				}, delta);
			}
		}
	}());