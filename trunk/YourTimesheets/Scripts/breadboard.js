
    // breadboard: a simple eventing system for all ages
    function Breadboard() {
        var table = {};
        
        // attach event listener
        this.listen = function(evt, handler) {
            (table[evt] || (table[evt] = [])).push(handler);
        }
        
        // hook a typical "onsomethinghappens" method into breadboard
        this.hook = function(evt) {
            var me = this;
            return function(context) {
                return me.fire(evt, context);
            }
        }
        
        // explicitly fire an event
        this.fire = function(evt, context) {
            var handlers = table[evt];
            if (handlers) {
                context = context || {};
                var result = true;
                for(var i = 0; i < handlers.length; i++) {
                    if (!handlers[i].apply(context)) {
                        result = false;
                    }
                }
            }
            return result;
        }
    };
