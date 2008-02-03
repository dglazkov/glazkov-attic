
	function Query(o) {
		if (o) {
			var q = function() {
				var ms = Query.members;
				for(var m in Query.ms) {
					this[m] = ms[m];
				}
			}
			q.prototype = o;
			return new q(o);
		}
	}
	
	// http://api.flickr.com/services/feeds/photos_public.gne
	Query.feed_user = { id: -1, tags: 0 }

	// http://api.flickr.com/services/feeds/groups_pool.gne
	Query.feed_group = { id: -1 }
	
	// http://api.flickr.com/services/feeds/photos_public.gne
	Query.feed_all = { tags: 0 }
	
	Query.api_user = { method: "flickr.people.getPublicPhotos", api_key: -1, user_id: -1, extras: "owner_id,date_taken,tags", per_page: 100, page: 1 }
	
	Query.api_group = { method: "flickr.groups.pools.getPhotos", api_key: -1, group_id: -1, user_id: 0, tags: 0, extras: "owner_id,date_taken,tags", per_page: 100, page: 1 }
	
	Query.api_all = { method: "flickr.photos.getRecent", api_key: -1, extras: "owner_id,date_taken,tags", per_page: 100, page: 1 }
	
	Query.param_ptn = ["", "=", ""];
	
	Query.members = {
		format: "json",
		toString: function() {
			var r = [];
			for(var n in this) {
				var m = this[n];
				if (m != 0) {
					var p = Query.param_ptn;
					if (!/function/i.test(typeof(m))) {
						p[0] = n;
						p[2] = m;
						r.push(p.join(""));
					}
					
				}
			}
			return r.join("&");
		}
	}