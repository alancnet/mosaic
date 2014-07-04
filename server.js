var express = require('express'),
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
    streamer = require('./streamer');

var app = express();

// App configure
{
    app.use(express.static('./www'));
    app.use(expressSession({
        secret: config.sessionSecretKey,
        resave: false,
        saveUninitialized: false
    }));
    app.use(cookieParser(config.cookieSecretKey));
    app.use(bodyParser());
    app.use(passport.initialize());
    app.use(passport.session());
}

// Twitter 
{
    app.get('/auth/twitter', passport.authenticate('twitter'));
    
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/saveLogin',
            failureRedirect: '/login'
        })
    );
    
    passport.use(new TwitterStrategy({
            consumerKey: config.twitterApiKey,
            consumerSecret: config.twitterSecretKey,
            callbackURL: 'https://mosaic-c9-alancnet.c9.io/auth/twitter/callback' //"https://mosaic-c9-alancnet.c9.io/auth/twitter/callback"
        },
        function(token, tokenSecret, profile, done) {
            var user = {
                token: token,
                tokenSecret: tokenSecret,
                screenName: profile.screen_name
            }
            done(null, user);
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
}
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/saveLogin', function(req, res) {
    if (res.user) {
        res.cookie('twitter', JSON.stringify(req.user));
    }
    res.redirect('/test');
});

app.get('/teststream', function(req, res) {
    var count = 0;
    var int = setInterval(function() {
        while (!res.write(',' + count++)) {};
        if (count > 100) {
            clearInterval(int);
            res.end();
        }
    }, 100);
});


app.get('/test', function(req, res) {
    console.log(1);
    if (1 || req.user) {
        console.log(2);

        var oauth = new OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            config.twitterApiKey,
            config.twitterSecretKey,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        oauth.get(
            'https://stream.twitter.com/1.1/statuses/filter.json?track=usa',
            config.accessToken, //test user token
            config.accessTokenSecret, //test user secret
            function (e, data, ores){
                if (e) console.error(e);
                console.log(require('util').inspect(data));
                res.send(JSON.stringify(data));
            });
    } else {
        res.send('Hello World :) <a href="/auth/twitter">Login</a>');
    }
})

app.get('/stream', function(sreq, sres) {
    var key = streamer.subscribe(function(chunk) {
        sres.write(chunk);  
    })
    sreq.on('close', function() {
        streamer.unsubscribe(key);
    });
});

console.log('c');
app.listen(process.env.PORT, process.env.IP);
console.log('d');


