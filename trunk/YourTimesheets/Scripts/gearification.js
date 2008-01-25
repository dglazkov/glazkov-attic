// breadboard is global, so that online.js can fire an event
window.breadboard = new Breadboard(); 

// .. the rest is tucked away into a private scope
// using anonymous function
// ideally, all JS files should go here,
// but I decided to keep them split up for readability
(function() {

    var online;
    var needsRefresh;
    
    var db = new Database();
    var store = new Store();
    var dom = new DOM();
    var sync = new Sync();
    var validator = new Validator();
    
    // connect DOM events to breadboard
    dom.onsubmit = breadboard.hook('submit');
    dom.oninputchange = breadboard.hook('change');
    dom.onready = breadboard.hook('ready');
    
    // connect Sync events to breadboard
    sync.oncomplete = breadboard.hook('harmony');
    sync.onentryuploaded = breadboard.hook('uploaded');
    sync.onerror = breadboard.hook('error');
 
    // what to do when page is ready
    breadboard.listen('ready', function() {
        // detect if gears are present and bail if not
        if (!window.google || !google.gears || !store.open() || !db.open()) {
            return;
        }
        
        dom.init();
        
        if (online) {
            sync.start(dom.getPostbackUrl());
        }
        
        db.readEntries(dom.offlineTableWriter);
        
        dom.initFields(validator.seedGoodValue);
        
        dom.indicate('info', 
            online ? 
            'Gears are ready, waiting for the glorious opportunity' : 
            'This page is offline. Entries will be synchronized when it goes back online');
    });
    
    // fires when the page is definitively online
    breadboard.listen('online', function() {
        online = true;
    });
    
    // what to do when an entry was submitted
    breadboard.listen('submit', function() {
        // submit data into the Gears database
        // while the application is offline
        if (online) {
            return true;
        }
        try {
            db.writeEntry(dom.collectFieldValues());
            db.readEntries(dom.offlineTableWriter);
        } catch (e) { 
            dom.indicate('error', 'Submission failed, because ' + e.message);
        }
    });
    
    // what to do when a field value has changed
    breadboard.listen('change', function() {
        dom.setSubmitEnabled(validator.isValid(this.type, this.value));
    });
    
    // what do do when an offline entry was uploaded to the server
    breadboard.listen('uploaded', function() {
        needsRefresh = true;
        dom.removeRow(this.id);
    });
    
    // what do to when harmony (offline and online entries synchronized) is achieved. Ommm...
    breadboard.listen('harmony', function() {
        if (needsRefresh) {
            dom.removeOfflineTable();
            store.refresh();
            dom.indicate('info', 'Synchronization complete. Please reload the page to see the results.');
        }
    });
    
    // what to do when an error has occured
    breadboard.listen('error', function() {
        dom.indicate('error', this.message);
    });
            
}());