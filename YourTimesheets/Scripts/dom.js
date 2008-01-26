    
    // encapsulates  DOM manipulation and events
    function DOM() {
        var OFFLINE_SHEET_ID = 'OfflineSheet';
        var FORM_ID = 'YourTimesheets';
        var SUBMIT_ID = 'SubmitNewEntry';
        var ONLINE_SHEET_ID = 'OnlineSheet';
        var NEW_ENTRY_ID = 'NewEntry';
        var MESSAGE_ID = 'Message';
        var FIELDS = [ 'StartDateTime', 'DurationMins', 'Project', 'Billable', 'Comment' ];
        var MESSAGE_TMPL = [ '<div class="type">', 1, '</div><div class="message">', 3, '</div><div class="shelf"></div>' ];
        var CHECKBOX_TMPL = [ '<span disabled="disabled"><input type="checkbox" name="disabled-checkbox" disabled="disabled" ', 1, ' /></span>' ];
        var ROW_TMPL = [ '<tr id="r', 1, '"><td>', 3, '</td><td>', 5, '</td><td>', 7, '</td><td>', 9, '</td><td>', 11, '</td></tr>' ];
        var me = this;
        
        // internal tracker of submit state to avoid excessive DOM querying
        var submitEnabled = true;        
        
        // initialize with empty event handlers
        this.onready = nil;
        this.oninputchange = nil;
        this.onsubmit = nil;
        
	    this.init = function() {
	        // hook up change event for each input
	        for(var i = 0; i < FIELDS.length; i++) {
	            gid(FIELDS[i], function(input) {
	                if (input.addEventListener) {
	                    input.addEventListener('input', fireOnInputChange, false);
	                }
	                else {
	                    input.onpropertychange = fireOnInputChange;
	                }
	                
	                function fireOnInputChange() {
                        me.oninputchange(input.className, input.value);
	                }
	            });
	        }
            // hook up to the submit event
            gid(FORM_ID, function(form) {
                form.onsubmit = me.onsubmit;
            });
        }
        
        // loads (or reloads) entries, entered offline
        // by creating and populating a table just above the regular timesheets table
        this.offlineTableWriter = {
            open: function() {
                this.html = [];
            },
            write: function(r, i, next) {
                if (i == 0) {
                    // if there are indeed rows in the table
                    // create table header by jamming together FIELDS and ROW_TMPL
                    // and then replacing all <td>s to <th>s
                    this.html.push('<h2>Entered Offline</h2><table>');
                    ROW_TMPL[1] = '0';
                    for(var i = 0; i < FIELDS.length; i++) {
                        ROW_TMPL[i*2 + 3] = FIELDS[i];
                    }
                    this.html.push(ROW_TMPL.join('').replace(/d>/g, 'h>'));
                }
                ROW_TMPL[1] = r.rowid;
                for(var i = 0; i < FIELDS.length; i++) {
                    ROW_TMPL[i*2 + 3] = r[FIELDS[i]];
                }
                this.html.push(ROW_TMPL.join(''));
                next();
            },
            close: function() {
                if (this.html.length) {
                    this.html.push('</table>');
                    var sheet;
                    if (!gid(OFFLINE_SHEET_ID, function(el) {
                        // table already exists
                        sheet = el;
                    })) {
                        // create offline table
                        gid(ONLINE_SHEET_ID, function(el) {
                            sheet = insb(el, OFFLINE_SHEET_ID);
                        });
                    }
                    sheet.innerHTML = this.html.join('');
                }
            }
        }
        
        // provide capability to show an error or info message
        this.indicate = function(type, text) {
            var message;
            if (!gid(MESSAGE_ID, function(el) {
                message = el;
            })) {
                gid(NEW_ENTRY_ID, function(el) {
                    message = insb(el, MESSAGE_ID);
                });
            }
            message.className = type;
            MESSAGE_TMPL[1] = type;
            MESSAGE_TMPL[3] = text;
            message.innerHTML = MESSAGE_TMPL.join('');
        }
        
        // grab relevant input values from the form
        this.collectFieldValues = function() {
            var params = [];
            var data = [];
            // accumulate field values
            for(var i = 0; i < FIELDS.length; i++) {
                gid(FIELDS[i], acc);
            }
            var inputs = document.getElementsByTagName('input');
            for(var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (input.type == 'hidden' || input.type == 'submit') {
                    appendData(input.name, input.value);
                }
            }
            params.push(data.join('&'));
            
            return params;
            
            // parameter accumulator. Takes element (el)
            // and stuff into the parameter array
            function acc(el) {
                if (el.type == 'checkbox') {
                    if (el.checked) {
                        appendData(el.name, 'on');
                        CHECKBOX_TMPL[1] = 'checked';
                    }
                    else {
                        CHECKBOX_TMPL[1] = '';
                    }
                    params.push(CHECKBOX_TMPL.join(''));
                }
                else {
                    appendData(el.name, el.value);
                    params.push(el.value);
                }
            }
            
            function appendData(key, value) {
                return data.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
        }
        
        // obtain postback URL
        this.getPostbackUrl = function() {
            var url;
            gid(FORM_ID, function(form) {
                url = form.action;
            });
            return url;
        }
        
        
        // remove a row from the offline table
        this.removeRow = function(id) {
            gid('r' + id, function(row) {
                del(row);
            });
        }
        
        // remove entire offline table
        this.removeOfflineTable = function() {
            gid(OFFLINE_SHEET_ID, function(table) {
                del(table);
            });
        }
        
        // enable or disable submit
        this.setSubmitEnabled = function(enable) {
            if (submitEnabled != enable) {
                submitEnabled = enable;
                gid(SUBMIT_ID, function(submit) {
                    submit.disabled = !enable;
                });
            }
        }
        
        // iterate through fields and initialize field values, according to type
        this.initFields = function(action) {
            for(var i = 0; i < FIELDS.length; i++) {
                gid(FIELDS[i], function(input) {
                    input.value = action(input.className);
                });
            }
        }
        
        // your typical DOMContentLoaded fare
	    var fired;
	    var safari = /WebKit/i.test(navigator.userAgent);

	    if (document.addEventListener && !safari) {
		    document.addEventListener('DOMContentLoaded', fire, false);
	    } else {
		    // Dean Edwards (http://dean.edwards.name/)
		    /*@cc_on @*/
		    /*@if (@_win32)
			    document.write('<script id=__ie_onload defer src=//:><\/script>');
			    var script = document.getElementById('__ie_onload');
			    script.onreadystatechange = function() { this.readyState == 'complete' && fire(); }
		    @else */
		    wait(30000, 100)
		    /*@end @*/
	    }
    	
	    function fire() {
		    fired = true;
		    me.onready();
	    }

 	    function wait(timeout, delta) {
		    if (window.webroot != 'yes') {
			    var interval = window.setInterval(function() {
				    if (fired) {
					    window.clearInterval(interval);
					    // John Resig via Dean Edwards (http://dean.edwards.name/)
				    } else if ((safari && /loaded|complete/.test(document.readyState))||timeout < 0) {
					    window.setTimeout(fire, 0);
				    }
				    timeout -= delta;
    				
			    }, delta);
		    }
	    }
	    
       // getElementById convenience wrapper
        // gets element by "id" and does "act(element, id)" on it, if exists
        // returns false, if element is not found
        // true, otherwise
        function gid(id, act) {
            var e = document.getElementById(id);
            return e && (act(e, id), true);
        }
        
        function insb(el, id) {
            var result = el.parentNode.insertBefore(document.createElement('div'), el);
            result.id = id;
            return result;
        }
        
        function del(el) {
            el.parentNode.removeChild(el);
        }
        
        // ever-so-important empty function
        function nil() {}
    }
    
