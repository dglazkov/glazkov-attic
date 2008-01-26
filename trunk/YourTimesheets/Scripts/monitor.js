
    // provides connection monitoring
    function Monitor() {
        // triggered when connection changes
        this.onconnectionchange = nil;
        
        var me = this;
    
        this.start = function() {
            try {
                wp = google.gears.factory.create('beta.workerpool', '1.0');
            }
            catch(e) {
                return false;
            }
            wp.onmessage = function(a, b, message) {
                if (message.sender == id) {
                    // only two messages: 
                    // first [f]ailure to connect 
                    // or back [o]nline
                    var text = message.text;
                    if (text == 'f') {
                        me.onconnectionchange(false);
                    }
                    else if (text == 'o') {
                        me.onconnectionchange(true);
                    }
                }
            }
            id = wp.createWorker(String(worker) + ';worker()');
            // send a message to the worker, identifying owner's id
            wp.sendMessage(window.location + '?poll', id);
            return true;
        }
        
        function worker() {
            var POLLING_INTERVAL = 2000;
            
            var wp = google.gears.workerPool;
            var url;
            var parentId;
            
            var first = true;
            var online;
            
            var timer = google.gears.factory.create('beta.timer', '1.0');
            
            wp.onmessage = function(a, b, message) {
                url = message.text;
                parentId = message.sender;
                poll();
            }
            
            function poll() {
                var request = google.gears.factory.create('beta.httprequest', '1.0');
                request.open('HEAD', url);
                request.onreadystatechange = function() {
                    if (request.readyState == 4) {
                        try {
                            if (request.status == 200) {
                                if (!online) {
                                    online = true;
                                    wp.sendMessage('o', parentId);
                                }
                            }
                        }
                        catch(e) {
                            if (online || first) {
                                online = false;
                                first = false;
                                wp.sendMessage('f', parentId);
                            }
                        }
                        wp.sendMessage('d', parentId);
                        timer.setTimeout(poll, POLLING_INTERVAL);
                    }
                }
                try {
                    request.send();
                }
                catch(e) {
                    if (online) {
                        online = false;
                        wp.sendMessage('f', parentId);
                    }
                }
            }

        }
        
        function nil() {}
    }
