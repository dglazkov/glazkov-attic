
	//	Light-Weight Flickr Integration (LWFI)
	// 		user = photos by user
	// 		group = photos in pool
	// 		tag = photos with tag
	// 		user & group = photos by user in group pool
	// 		user & tag = photos by user with tag
	// 		group & tag = photos in group pool with tag
	// 		user & group & tag = photos by user in group pool with tag
	
	// todo: rename library to lwfi.js
	// todo: implement query parameter-based exposure of API
	
	call_factory.init();

	function bind(group, user, tag) {
		this.className += " lwfi-bound";
		var me = this;
		var q = Query({key: "key-value", test: "test-value"});
		console.debug(q, q + "");
		
		//if (group) {
		//	// flickr.groups.pools.getPhotos call
		//	worker.group(user, group, tag, injector);
		//}
		//else if (user) {
		//	// flickr.people.getPublicPhotos call
		//	worker.user(user, tag, injector);
		//}
		//else {
		//	// flickr.photos.getRecent call
		//	worker.all(tag, injector);
		//}
		
		function injector(html) {
			var to = me.appendChild(document.createElement("div"));
			to.className = "lwfi-photos";
			to.innerHTML = html;
		}
	}
		
	(function() {
		var fired;
		var safari = /WebKit/i.test(navigator.userAgent);
		
		if (document.addEventListener && !safari) {
			document.addEventListener("DOMContentLoaded", fire, false);
		} else {
			// Dean Edwards (http://dean.edwards.name/)
			/*@cc_on @*/
			/*@if (@_win32)
				document.write("<script id=__ie_onload defer src=//:><\/script>");
				var script = document.getElementById("__ie_onload");
				script.onreadystatechange = function() { this.readyState == "complete" && fire(); }
			@else */
			wait(30000, 100)
			/*@end @*/
		}
		
		function fire() {
			fired = true;
			var params = [ "group", "user", "tag" ];
			u.foreach(u.select(document, "flickr"), function(flickr) {
				bind.apply(flickr, u.map(params, function(p) {
					return u.first(u.select(flickr, p));
				}));
			})
		}
	
		function wait(timeout, delta) {
			if (window.webroot != "yes") {
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