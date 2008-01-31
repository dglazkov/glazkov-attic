        
    // synchronizes (in a very primitive way) any entries collected offline
    // with the database on the server by replaying form submissions
    function Sync() {
        var wp;
        var id;
        var me = this;

        //  called when a synchronization error has occured. Sends:
        //      message : String, the message of the error
        this.onerror = nil;
        
        //  called when the synchronization is complete.
        this.oncomplete = nil;
        
        // called when an entry was uploaded to the server. Sends:
        //      id : String, the rowid of the entry
        this.onentryuploaded = nil;
        
        //  starts synchronization. Takes:
        //      url : String, the url to which to replay POST requests
        this.start = function(url) {
            try {
                wp = google.gears.factory.create('beta.workerpool', '1.0');
            }
            catch(e) {
                return false;
            }
            wp.onmessage = function(a, b, message) {
                if (message.sender == id) {
                    // only two message types: [f]ailure or [id] of successfully
                    // sync'd entry
                    var text = message.text;
                    if (text == 'f') {
                        me.onerror('Synchronization failure. Any invalid entries were discarded.');
                    }
                    else if (text == 'd') {
                        me.oncomplete();
                    }
                    else {
                        me.onentryuploaded(text);
                    }
                }
            }
            id = wp.createWorker(String(Database) + String(worker) + ';worker()');
            // send a message to the worker, identifying owner's id
            // and enclosing the URL to which to upload entries
            wp.sendMessage(url, id);
            return true;
        }
        
        // runs in separate thread to perform the synchronization
        function worker() {
            var wp = google.gears.workerPool;
            var db = new Database();
            var parentId;
            var url;
            wp.onmessage = function(a, b, message) {
                parentId = message.sender;
                url = message.text;
                db.open();
                db.readEntries({
                    open: function() {},
                    write: function(p, i, next) {
                        var request = google.gears.factory.create(
                            'beta.httprequest', '1.0');
                        request.open('POST', url);
        			    request.setRequestHeader(
        			        'Content-Type', 'application/x-www-form-urlencoded');
                        request.onreadystatechange = function() {
                            if (request.readyState == 4) {
                                if (request.status == 200) {
                                    wp.sendMessage(String(p.rowid), parentId);
                                    next();
                                }
                                else {
                                    wp.sendMessage('f', parentId);
                                    next(true);
                                }
                            }
                        };
                        // replay form data
                        request.send(p.FormData);
                    },
                    close: function() {
                        db.clear();
                        wp.sendMessage('d', parentId);
                    }
                });
            }
        }
        
        function nil() {}
    }
