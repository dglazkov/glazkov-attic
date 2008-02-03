
	//	Light-Weight Flickr Integration (LWFI)
	// 		user = photos by user
	// 		group = photos in pool
	// 		tag = photos with tag
	// 		user & group = photos by user in group pool
	// 		user & tag = photos by user with tag
	// 		group & tag = photos in group pool with tag
	// 		user & group & tag = photos by user in group pool with tag

	function init() {
		var json = new Json();
		var params = [ "group", "user", "tag" ];
		u.foreach(u.select(document, "lwfi"), function(lwfi) {
			u.foreach(u.select(lwfi, "flickr"), function(flickr) {
				bind.apply(flickr, u.map(params, function(p) {
					return parseHref(u.first(u.select(flickr, p)));
				}));
			});
		})	

		// TODO: Combine Flickr constructor and this
		function bind(group, user, tag) {
			this.className += " lwfi-bound";
			var me = this;
			
			console.log(this, group, user, tag);
			
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
		
		function parseHref(a) {
			var v;
			return a && (v = a.href.match(/\/([^\/]+)\/$/), v && v.length && v[1]);
		}
	};
	