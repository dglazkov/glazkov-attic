	
	_IG_RegisterOnloadHandler(function() {
		var now = new Date();
		var twit_html = [ '<li class="hentry"><div class="l-left" style="background-image:url(\'', 1, '\');"></div><div class="l-right"><div class="vcard"><a class="url fn" target="_blank" href="http://twitter.com/', 3, '">', 5, '</a></div><div class="entry-title entry-content">', 7, '</div><a target="_blank" rel="bookmark" href="http://twitter.com/', 9, '/statuses/', 11, '"><abbr class="published" title="', 13, '">', 15, '</abbr></a>from ', 17, '</div><div class="l-shelf"></div></li>'];
		var list_html = [ '<ul class="', 1, '">', 3, '</ul>' ];
		var status_rt = {
			created_at: function(value) {
				twit_html[13] = value;
				twit_html[15] = relativizeDate(now, value);
			},
			id: function(value) {
				twit_html[11] = value;
			},
			text: function(value) {
				twit_html[7] = value.replace(/http:\/\/[\d\w\/+\.]+/g, '<a target="_blank" class="embedded" href="$&">$&</a>').replace(/@([\d\w]+)/g, '<a target="_blank" class="embedded" href="http://twitter.com/$1">$&</a>');
			},
			source: function(value) {
				twit_html[17] = value;
			},
			user: function(value, node) {
				route(node, user_rt);
			}
		}
		var user_rt = {
			screen_name: function(value) {
				twit_html[9] = twit_html[3] = twit_html[5] = value;
			},
			profile_image_url: function(value) {
				twit_html[1] = value;
			}
		}

		var panel = _gel('twitter-panel');
		var message = _gel('twitter-message');
				
		message.innerHTML = 'Loading Twitter feed ...'
		_IG_FetchXmlContent('http://twitter.com/statuses/friends_timeline.xml?id=' + new _IG_Prefs().getString("userid"), function(xml) {
			if (!xml.nodeType) {
				message.innerHTML = xml;
				return;
			}
			var statuses = xml.getElementsByTagName('status');
			var list = [];
			if (statuses) {
				for(var i = 0; i < statuses.length; i++) {
					route(statuses[i], status_rt);
					list.push(twit_html.join(''));
				}
			}
			message.innerHTML = '';
			list_html[1] = 'statuses';
			list_html[3] = list.join('');
			panel.innerHTML = list_html.join('');
			_IG_AdjustIFrameHeight();
		});
		
		function forEachChild(node, func) {
			var child = node && node.firstChild;
			do {
				child.nodeType == 1 && func(child);
			} while(child = child.nextSibling);
		}
		
		function route(node, rt) {
			forEachChild(node, function(child) {
				(rt[child.nodeName] || nil)(child.firstChild && child.firstChild.nodeValue, child);
			});
		}
		
		function relativizeDate(now, s) {
			var date = Date.parse(s);
			if (date) {
				var diff = (now - date) / 60000;
				if (diff < 1) {
					return "a few seconds ago";
				}
				else if (diff < 2) {
					return "about a minute ago";
				}
				else if (diff < 60) {
					return parseInt(diff, 10) + " minutes ago";
				}
				else {
					diff = diff / 60;
					if (diff < 2) {
						return "an hour ago";
					}
					else if (diff < 24) {
						return parseInt(diff, 10) + " hours ago";
					}
					else {
						diff = diff / 24;
						if (diff < 2) {
							return "a day ago";
						}
						else if (diff < 30) {
							return parseInt(diff, 10) + " days ago";
						}
						else {
							diff = diff / 30;
							if (diff < 2) {
								return "about a month ago";
							}
							else if (diff < 12) {
								return parseInt(diff, 10) + " months ago";
							}
							else {
								diff = diff / 12;
								if (diff < 2) {
									return "about a year ago";
								}
								return parseInt(diff, 10) + " years ago";
							}
						}
					}
				}
			}
			return s;        
		}
		
		function nil() {}
	});