
	_IG_RegisterOnloadHandler(function() {
		var item_html = [ '<li><a href="', 1, '">', 3, '</a></li>' ];
		var list_html = [ '<ul class="', 1, '">', 3, '</ul>' ];
		
		var panel = _gel('open-zombie-panel');
		var message = _gel('open-zombie-message');
		
		message.innerHTML = 'Initializing...';
		var req = opensocial.newDataRequest();
		req.add(req.newFetchPersonRequest('OWNER'), 'owner');
		req.add(req.newFetchPersonRequest('VIEWER'), 'viewer');
		req.add(req.newFetchPersonAppDataRequest('VIEWER', 'bitten'), 'bitten');
		req.send(function(data) {
			if (data.hadError()) {
				message.innerHTML = 'API Error has occured while trying to initialize';
				return;
			}
			var owner = getPersonData(data, 'owner');
			var viewer = getPersonData(data, 'viewer');
			message.innerHTML = '';
			if (owner.id != viewer.id) {
				var bitten = data.get('bitten').getData();
				if (!bitten) {
					req = opensocial.newDataRequest();
					req.add(req.newUpdatePersonAppDataRequest('VIEWER', 'bitten', '[]'));
					req.send(function(data) {
						if (data.hadError()) {
							message.innerHTML = 'API Error has occured while trying to bite';
							return;
						}
						opensocial.requestCreateActivity(
							opensocial.newActivity(
								opensocial.newStream('', 'OpenZombie'), owner.name + ' just bit ' + viewer.name + '!'), 'HIGH', function(data) {
									panel.innerHTML = 'Aaah! You were just bitten by ' + owner.name + '. To avenge your lost soul, install this app on your profile and let it feast on the unsuspecting passerbys.';
						});
					})
				}
				else {
					panel.innerHTML = 'Welcome back, my fellow zombie.';
				}
			}
			else {
				panel.innerHTML = 'Hello, my master. I have been biting poor slobs who came by this profile, just as you commanded.';
			}
		})
		
		function getPersonData(data, key) {
			var d = data.get(key).getData();
			return { id: d.getId(), name: d.getDisplayName() };
		}
		
		//message.innerHTML = 'Biting myself...';
		//var req = opensocial.newDataRequest();
		//req.add(req.newUpdatePersonAppDataRequest('VIEWER'))
		
		//message.innerHTML = 'Loading friends ...';
		//var req = opensocial.newDataRequest();
		//req.add(req.newFetchPeopleRequest('VIEWER_FRIENDS'), 'friends');
		//req.send(function(data) {
		//	if (data.hadError()) {
		//		message.innerHTML = 'API error has occured. FAIL.';
		//		return;
		//	}
		//	message.innerHTML = 'Parsing friends ...';
		//	var list = [];
		//	data.get('friends').getData().each(function(friend) {
		//		item_html[1] = friend.getField('PROFILE_URL');
		//		item_html[3] = friend.getDisplayName()
		//		list.push(item_html.join(''));
		//	});
		//	if (!list.length) {
		//		message.innerHTML = 'You have no friends, you poor slob.';
		//		return;
		//	}
		//	message.innerHTML = '';
		//	panel.innerHTML = (list_html[1] = 'friends', list_html[3] = list, list.join(''));
		//});
	});