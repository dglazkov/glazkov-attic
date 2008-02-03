	if (window.google && google.gears) {
		s(google.gears.factory);
	}
	else {
		var f;
		
		// Firefox
		if (typeof GearsFactory != "undefined") {
			f = new GearsFactory();
		}
		else 
			// IE
			try {
				f = new ActiveXObject("Gears.Factory");
			} catch (e) {
			  // Safari
				var t = "application/x-googlegears";
				if (navigator.mimeTypes[t]) {
					f = document.createElement("object");
					f.style.display = "none";
					f.width = 0;
					f.height = 0;
					f.type = t;
					document.documentElement.appendChild(f);
				}
			}

		if (f) {
			if (!window.google) {
				window.google = {}
			}
			google.gears = { factory: f };
			s(f);
		}
	}
	
	function s(f) {
		var r = new Runner();
		
		window.openDatabase = function(n, v) {
			// TODO: Add checking for version
			return new Database(r, n, v);
		}
	}