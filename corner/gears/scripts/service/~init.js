	
	gearsWorkerPool.onmessage = function(message, id) {
		try {
			gearsWorkerPool.sendMessage("[" + message + ", " + id + "]", 0);
		}
		catch(e) {
			// :()
		}
	}
