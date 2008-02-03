
	function Controller() {
		var updater = new Updater();

		this.start = function(view, model) {
			this.view = view;
			this.model = model;
			window.c = this;
			updater.start();
			model.open();
			model.setOnError(function(msg, e) {
				console.debug(e);
			})
		
			view.create();
			this.sort("page_created");
		}
		
		this.sort = function(by) {
			by = by || this.current_sort;
			this.current_sort = by;
			var last;
			this.view.clear("data");
			this.model.forSortedItems(by, function(item) {
				console.log("controller.sort", item);
				var current = item[by];
				if (current != last) {
					if (last) {
						this.view.endGroup();
					}
					this.view.startGroup(current, by);
					last = current;
				}
				this.view.renderItem(item, by);
			}, this);
			return false;
		}
		
		this.addPage = function() {
			this.model.addPage(this.view.areas.url.value);
			updater.restart();
			this.sort();
		}		
	}
	
		
	; // i like semicolons