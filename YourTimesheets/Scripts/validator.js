
    //  encapsulates validation of values by type
    function Validator() {
        var VALUE_TMPL = [ 0,'/',2,'/',4,' ',6,':',8 ];

        var table = {
            datetime: {
                good: function() {
                    var date = new Date();
                    VALUE_TMPL[0] = date.getMonth() + 1;
                    VALUE_TMPL[2] = date.getDate();
                    VALUE_TMPL[4] = date.getFullYear();
                    VALUE_TMPL[6] = date.getHours();
                    VALUE_TMPL[8] = Math.round(date.getMinutes() / 10) * 10;
                    return VALUE_TMPL.join('');
                },
                valid: function(value) {
                    //  this is a dastardly validator for date/time, hacked in 
                    //  record time by 3 drunk monkey please do not use it 
                    //  anywhere in your code unless you like being made fun of
                    var matches = value.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(?:(\d{1,2}):(\d{2})(?::(\d{2})){0,1}){0,1}\s*$/);
                    if (matches) {
                        var year = matches[3];
                        var month = matches[1] || 0;
                        var day = matches[2] || 0;
                        var hours = matches[4] || 0;
                        var minutes = matches[5] || 0;
                        var seconds = matches[6] || 0;
                        var tester = new Date(year, month, day, hours, minutes, 
                            seconds);
                        return tester && tester.getFullYear() == year
                            && tester.getMonth() == month 
                            && tester.getDate() == day
                            && tester.getHours() == hours 
                            && tester.getMinutes() == minutes
                            && tester.getSeconds() == seconds;
                    }
                    return false;
                }
            },
            number: {
                good: function() {
                    return '30';
                },
                valid: function(value) {
                    return !isNaN(value);
                }
            },
            other: {
                good: function() {
                    return '';
                },
                valid: function(value) {
                    return true;
                }
            }
        }
        
        //  provides good initial value, given a type. Takes:
        //      type : String, the type of the input, like 'datetime' or 
        //          'number'
        //      returns : String, initial value
        this.seedGoodValue = function(type) {
            return (table[type] || table.other).good();
        }
        
        //  validates a value of a specified type. Takes:
        //      type : String, the type of the input.
        //      value : String, value to validate
        //      returns : Boolean, true if value is valid, false otherwise
        this.isValid = function(type, value) {
            return (table[type] || table.other).valid(value)
        }
    }
