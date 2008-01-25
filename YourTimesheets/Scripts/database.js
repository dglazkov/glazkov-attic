
    // encapsulates the database operations
    function Database() {
        var db;
        var timer;
        
        this.open = function() {
            try {
                db = google.gears.factory.create('beta.database', '1.0');
                timer = typeof(window) == 'undefined' ? google.gears.factory.create('beta.timer', '1.0') : window;   
            }
            catch(e) {
                return false;
            }
            db.open('YourTimesheets');
            db.execute('CREATE TABLE IF NOT EXISTS Entries(StartDateTime TEXT, DurationMins INT, Project TEXT, Billable TEXT, Comment TEXT, FormData TEXT)');
            return true;
        }
        
        this.writeEntry = function(params) {
            db.execute('INSERT INTO Entries VALUES(?,?,?,?,?,?)', params);
        }

        this.readEntries = function(writer) {
            writer.open();
            var rs = db.execute('SELECT rowid, * FROM Entries');
            var i = 0;
            var c = rs.fieldCount();
            yieldCall();
            
            function yieldCall() {
                if (rs.isValidRow()) {
                    var r = {};
                    for(var j = 0; j < c; j++) {
                        r[rs.fieldName(j)] = rs.field(j);
                    }
                    writer.write(r, i++, nextCallback);
                    return;
                }
                rs.close();
                writer.close();
            }
            
            function nextCallback(abort) {
                if (abort) {
                    rs.close();
                    writer.close();
                    return;
                }
                timer.setTimeout(function() {
                    rs.next();
                    yieldCall();
                }, 0);
            }
        }
        
        this.clear = function() {
            db.execute('DELETE FROM Entries');
        }
    }
