
	var call_factory = {
		api_call: ["http://api.flickr.com/services/rest/?method=", "", ""],
		create_from_feeds: function(group, user, tag, limit) {
			if (group) {
				
			}
		},
		create_from_api: function(group, user, tag) {
			
		},
		init: function() {
			var key;
			this.create = ((key = u.first(u.select(document, "flickr-api-key", "meta", "name"))) && (key = key.content)) ? this.create_from_api : this.create_from_feeds;
			this.key = key;
		}
	}
	