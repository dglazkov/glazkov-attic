
	function DateHelper(d) {
		if (d instanceof Date) {
			this.date = d;
		} else if (typeof(d) == "string") {
			var n = Date.parse(d);
			if (isNaN(n)) {
				var parts = d.split(" ");
				if (parts.length == 2) {
					var dateParts = parts[0].split("-");
					if (dateParts.length == 3) {
						var timeParts = parts[1].split(":");
						if (timeParts.length == 3) {
							this.date = new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
							return;
						}
					}
				}
				this.date = null;
			}
			else {
				this.date = new Date(n);
			}
		} else if (typeof(d) == "number") {
			this.date = new Date(d);
		}
	}
	
	DateHelper.months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
	
	DateHelper.prototype.getFriendly = function() {
		if (this.date) {
			return DateHelper.months[this.date.getMonth() - 1] + " " + this.date.getDate();
		}
		return "";
	}
	
	DateHelper.prototype.getFriendlyDate = function() {
		if (this.date) {
			return DateHelper.months[this.date.getMonth() - 1] + " " + this.date.getDate();
		}
		return "";		
	}
	
	DateHelper.prototype.getRelative = function() {
		if (this.date) {
			var diff = (new Date() - this.date) / 60000;
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
						return "over a day ago";
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
		return "sometimes";		
	}
	
	; // I like semicolons