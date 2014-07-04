var config = require('./config');

module.exports = {
    compileHeader: compileHeader,
    nonce: nonce,
    twitter: twitter
};
var count = 0;

function compileHeader(obj) {
    var segs = [];
    for (var key in obj) {
        segs.push(key + '="' + obj[key] + '"');
    }
    return 'OAuth ' + segs.join(', ');
}

function nonce() {
    return process.pid.toString(36) + new Date().getTime().toString(36) + (count++).toString(36);
}
