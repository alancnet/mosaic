var Channel = require('./channel').Channel,
    express = require('express'),
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    OAuth = require('oauth').OAuth,
    TwitterStrategy = require('passport-twitter').Strategy,
    config = require('./config'),
    twitter = require('./twitter'),
    https = require('https'),
    constants = require('constants'),
    Q = require('q');

var creq;
var ch = new Channel();
var mainDeferred = Q.defer();

ch.onfill = function() {
    console.log('starting up');
    var oauth = new OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        config.twitterApiKey,
        config.twitterSecretKey,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    creq = oauth.get(
        'https://stream.twitter.com/1.1/statuses/filter.json?track=usa',
        config.accessToken, //test user token
        config.accessTokenSecret //test user secret
    );
    creq.on('response', function(cres) {
        cres.on('data', function(buffer) {
            mainDeferred.notify(buffer.toString());
        })
    });
    creq.on('error', function(err) {
        if (ch.count) ch.onfill();
    });
    creq.on('close', function() {
        if (ch.count) ch.onfill();
    })
    creq.end();
}

ch.onempty = function() {
    console.log('shutting down');
    creq.abort();
}


function parseStream(promise) {
    var deferred = Q.defer();
    var current = '';
    promise.then(function() {
        deferred.resolve();
    }, function(err) {
        deferred.reject(err);
    }, function(chunk) {
        current += chunk;
        for (var i; (i = current.indexOf('\n')) != -1;) {
            var segment = current.substr(0, i);
            current = current.substr(i + 1);
            deferred.notify(segment);
        }
    });
    
    return deferred.promise;
}

function harvestImages(promise) {
    var cache = Array(200);
    var deferred = Q.defer();
    var current = '';
    promise.then(function() {
        deferred.resolve();
    }, function(err) {
        deferred.reject(err);
    }, function(json) {
        try {
            var data = JSON.parse(json);
            var media = data && data.entities && data.entities.media;
            if (media) {
                for (var i = 0; i < media.length; i++) {
                    var url = media[i].media_url;
                    if (url) {
                        if (cache.indexOf(url) == -1) {
                            deferred.notify(JSON.stringify(media[i]) + '\n');
                            cache.push(url);
                            cache = cache.splice(1);
                        } else {
                            console.log('skipped ' + url);
                        }
                    }
                };
            }
        } catch (ex) {
            console.error(ex.message);
        }
    });
    return deferred.promise;
}

harvestImages(parseStream(mainDeferred.promise))
.progress(function(data) {
    ch.notify(data);
})

module.exports = ch;