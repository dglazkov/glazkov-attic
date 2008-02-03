
	function Flickr(user, group, tag) {
		var params = [];
		
		if (user) {
			Flickr.p[0] = Flickr.n[0];
			Flickr.p[1] = user;
			params.push(Flickr.p.join("="));
		}
		if (group) {
			
		}
		if (tag) {
			
		}
		
		function makeParam(value, i) {
			var p;
			value && (p = Flickr.n[i] + "=" + value, params.push(p));
		}
	}
	
	Flickr.n = [ "user_id", "group_id", "tags" ];
	Flickr.p = [ 0, 0 ];
	Flickr.u = "http://api.flickr.com/services/rest/?method=flickr.";
	Flickr.k = "&api_key=";
	Flickr.u = "&user_id=";
	Flickr.e = "&extras=owner_id,date_taken,tags&per_page=100&page=1";
	Flickr.user = [ u, "people.getPublicPhotos", k, -1, u, -1, e ];
	Flickr.group = [ u, "groups.pools.getPhotos", k, -1, "&group_id=", -1, u, 0, "&tags=", 0, e ];
	Flickr.all = [ u, "photos.getRecent", k, -1, e ];
	Flickr.search = [ u, "photos.search", k, -1, "&", 0, e ];