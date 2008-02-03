new function() {


// ********
// pipe.js


	function Pipe(wp, sends, handler) {
		
		var forEach = Array.forEach || function(a, func, cx) {
			for(var i = 0; i < a.length; i++) {
				func.call(cx || {}, a[i], i, a);
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

// ********
// player.js


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
// ********
// ~boot.js


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
// ********
// ~init.js


	function init() {
		var workerUrl; 
		var player;
		if (workerUrl = readWorkerUrl()) {
			window.console || (window.console = { log: function() {} });
			assert() && (player = new Player(workerUrl)) && setup();
		}
		
		function assert() {
			// TODO: Really assert requirements
			return window.google && window.google.gears;
		}
		
		function setup() {
			var dirty;
			var listHtml = '<ul id="result-list"></ul>';
			
			gel('requirements').style.display = 'none';
			bef('div', 'results').innerHTML = listHtml;
			bef('form', 'player').innerHTML = '<div><button type="button" id="play">Play</button><textarea id="input" spellcheck="false">console.log(\'1\');\nopenDatabase(\'test\').transaction(function(tx) {\n	console.log(\'2\');\n	tx.executeSql(\'CREATE TABLE IF NOT EXISTS Pages(title TEXT, lastUpdated INTEGER)\', \n		[]);\n	console.log(\'3\');\n	tx.executeSql(\'INSERT INTO Pages VALUES(?, ?)\', \n		[ \'some title\', new Date().getTime() ]);\n	console.log(\'4\');\n	tx.executeSql(\'SELECT count(*) FROM Pages;\', \n		[],\n		function(tx, rs) {\n			console.info(\'5\');\n		});\n	console.log(\'6\');\n	tx.executeSql(\'SELECT * FROM Pages;\', \n		[],\n		function(tx, rs) {\n			console.info(\'7\');\n		});\n	console.log(\'8\');\n	tx.executeSql(\'SELECT title FROM Pages ORDER BY lastUpdated DESC;\', \n		[],\n		function(tx, rs) {\n			console.info(\'9\');\n		});\n	console.log(\'10\');\n});\nconsole.log(\'11\');</textarea></div>';
			gel('play').onclick = function() {
				var autoClear = gel('auto-clear');
				autoClear && autoClear.checked && (gel('results').innerHTML = listHtml, dirty = false);
				player.play(gel('input').value);
			}

			player.onmessage = function(type, text) {
				var list = gel('result-list');
				if (!dirty) {
					var p = list.parentNode;
					var button = p.insertBefore(document.createElement('button'), list);
					button.innerHTML = 'Clear Results';
					button.onclick = function() {
						gel('results').innerHTML = listHtml;
						dirty = false;
					}
					var autoClear = p.insertBefore(document.createElement('span'), list);
					autoClear.className = 'auto-clear';
					autoClear.innerHTML = '<input type="checkbox" id="auto-clear" checked="checked"><label for="auto-clear">Clear with each play</label>';
					gel('auto-clear').onclick = function() {
						return true;
					}
				}
				var item = list.appendChild(document.createElement('li'));
				item.className = type;
				dirty = true;
				item.innerHTML = '<span class="type">' + type + '</span><span class="message">' + unescape(text) + '</span>';
			}
			return true;
		}
		
		function bef(tag, id) {
			var n;
			return n = document.body.insertBefore(document.createElement(tag), gel('help')), n.id = id, n;
		}
		
		function gel(id) {
			return document.getElementById(id);
		}
		
		function readWorkerUrl() {
			var links = document.getElementsByTagName('link');
			for(var i = 0; i < links.length; i++) {
				var link = links[i];
				if (link.rel == 'worker') {
					return link.href;
				}
			}
		}
	}
	


}