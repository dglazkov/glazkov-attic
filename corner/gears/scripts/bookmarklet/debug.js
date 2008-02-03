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

		f && s(f);
	}
	
	function s(f) {
		try {
            var p = f.create("beta.workerpool", "1.1");
            p.onmessage = function(m, id, o) {
                console.log("response", m, id, o);
            }
			p.sendMessage(document.documentElement.innerHTML, p.createWorkerFromUrl("http://zen/build?dev/micro-wallet/scripts/service"));
            console.log("!!");
		}
		catch(e) {
            console.log(e);
        }
	}