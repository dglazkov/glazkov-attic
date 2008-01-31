   
    // encapsulates dealing with LocalServer
    // model
    function Store() {
        var STORE_NAME = 'YourTimesheets';
        var ASSETS = [ 
            '.', 
            'Default.aspx', 
            'Images/exclamation.png',
            'Images/information.png',
            'Scripts/breadboard.js', 
            'Scripts/database.js', 
            'Scripts/dom.js',
            'Scripts/gears_init.js',
            'Scripts/monitor.js',
            'Scripts/store.js',
            'Scripts/sync.js',
            'Scripts/validator.js',
            'Styles/screen.css'
            ];
        var store;
        var server;
        
        //  opens store and captures application assets if not captured already
        //      returns : Boolean, true if LocalServer and ResourceStore 
        //          instance are successfully created, false otherwise
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
        
        //  forces refresh of the ResourceStore
        this.refresh = function() {
            server.removeStore(STORE_NAME);
        }
        
        //  capture callback, empty because we really don't care when capture 
        //  completes
        function captureCallback() {}
    }
    
