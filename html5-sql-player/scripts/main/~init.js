
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
	
