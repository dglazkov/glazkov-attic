   
    // encapsulates dealing with LocalServer
    function Store() {
        var STORE_NAME = 'YourTimesheets';
        var ASSETS = [ 
            '.', 
            'Default.aspx', 
            'Images/exclamation.png',
            'Images/information.png',
            'Scripts/database.js', 
            'Scripts/dom.js',
            'Scripts/gearification.js', 
            'Scripts/gears_init.js',
            'Scripts/monitor.js',
            'Scripts/store.js',
            'Scripts/sync.js',
            'Scripts/validator.js',
            'Styles/screen.css'
            ];
        var store;
        var server;
        
        // opens store and caches assets if this is the first time
        this.open = function() {
            try {
                server = google.gears.factory.create('beta.localserver', '1.0');
            }
            catch(e) {
                return false;
            }
            var store = server.createStore(STORE_NAME);
            if (!store.isCaptured(ASSETS[0])) {
                // capture assets for the first time
                store.capture(ASSETS, captureCallback);
            }
            return true;
        }
        
        this.refresh = function() {
            server.removeStore(STORE_NAME);
        }
        // capture callback, empty because we really don't care when capture completes
        function captureCallback() {}
    }
    
