module.exports.Channel = Channel;

function Channel() {
    var c = {
        count: 0,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        notify: notify,
        onempty: function() {},
        onfill: function() {}
    }
    var unique = 0;
    var subscribers = {};
    return c;
    
    function notify(val) {
        for (var key in subscribers){
            subscribers[key](val);
        }
    }
    
    function subscribe(callback) {
        var key = 'key' + unique++;
        subscribers[key] = callback;
        c.count++;
        if (c.count === 1) c.onfill();
        console.log(c.count + " sessions");
        return key;
    }
    
    function unsubscribe(key) {
        if (subscribers[key]) {
            delete subscribers[key];
            c.count--;
            if (c.count === 0) c.onempty();
            console.log(c.count + " sessions");
            return true;
        }
        return false;
    }
    
}


