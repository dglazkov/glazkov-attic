
	SQLUtils = {
		versionMatches: function(name, version) {
			// TODO: Implement version matching
			return !version;
		},
		runAsync: function(func) {
			google.gears.factory.create("beta.timer", "1.0").setTimeout(func, 0);
		},
		errors: {
			versionMismatch: 'Version Mismatch'
		}
	}
