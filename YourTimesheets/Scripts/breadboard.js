// this is the "breadboard" that connects all the pieces together

// tucked away into a private scope using anonymous function
// ideally, all JS files should go here,
// but I decided to keep them split up for readability
(function() {

    var online;
    var initialized;
    var needsRefresh;
    
    var db = new Database();
    var store = new Store();
    var dom = new DOM();
    var sync = new Sync();
    var validator = new Validator();
    var monitor = new Monitor();
    
    // connect DOM events
    
    // what to do when an entry was submitted
    dom.onsubmit = function() {
        // submit data into the Gears database
        // while the application is offline
        if (online) {
            store.refresh();
            return true;
        }
        try {
            db.writeEntry(dom.collectFieldValues());
            db.readEntries(dom.offlineTableWriter);
        } catch (e) { 
            dom.indicate('error', 'Submission failed, because ' + e.message);
        }
        return false;
    }
    
    // what to do when a field value has changed
    dom.oninputchange = function(type, value) {
        dom.setSubmitEnabled(validator.isValid(type, value));
    }
    
    // what to do when page is ready
    dom.onready = function() {
        // detect if gears are present and bail if not
        // bailing out is a one of the options
        // another option would be suggest installing gears
        if (!window.google || !google.gears || !store.open() || !db.open()) {
            return;
        }
        
        monitor.start();
        
        dom.init();
        
        db.readEntries(dom.offlineTableWriter);
        
        dom.initFields(validator.seedGoodValue);

        dom.indicate('info', 'Waiting for the monitor to check connection');
    }
    
    // connect Monitor events
    
    monitor.onconnectionchange = function(connected) {
        online = connected;
        if (online) {
            dom.indicate('info', 'This page is online. Entries will be entered directly');
            sync.start(dom.getPostbackUrl());
        }
        else {
            dom.indicate('info', 'This page is offline. Entries will be synchronized when it goes back online');
        }
    }
    
    // connect Sync events

    // what do to when harmony (offline and online entries synchronized) 
    // is achieved. Ommm...
    sync.oncomplete = function() {
        if (needsRefresh) {
            dom.removeOfflineTable();
            store.refresh();
            dom.indicate('info', 'Synchronization complete. Please reload the page to see the results.');
        }
    }

    // what do do when an offline entry was uploaded to the server
    sync.onentryuploaded = function(id) {
        needsRefresh = true;
        dom.removeRow(id);
    }
    
    // what to do when a synchronization error has occured
    sync.onerror = function(message) {
        dom.indicate('error', message);
    }
 
                
}());