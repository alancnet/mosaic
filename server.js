var express = require('express'),
    expressSession = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    config = require('./config'),
    app = express(),
    twitter = require('./twitter');

// App configure
{
    app.use(express.static('./www'));
    app.use(expressSession({
        secret: config.sessionSecretKey,
        resave: false,
        saveUninitialized: false
    }));
    app.use(cookieParser());
    app.use(bodyParser());
    app.use(passport.initialize());
    app.use(passport.session());
}

// Twitter 
{
    app.get('/auth/twitter', passport.authenticate('twitter'));
    
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login'
        })
    );
    
    passport.use(new TwitterStrategy({
        consumerKey: config.twitterApiKey,
        consumerSecret: config.twitterSecretKey,
        callbackURL: "https://mosaic-c9-alancnet.c9.io/auth/twitter/callback"
      },
      function(token, tokenSecret, profile, done) {
        console.log("Successful login: %o %o %o", token, tokenSecret, profile);
        done(null, {findme: 'userObject'});
      }
    ));
}
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
app.get('/test', function(req, res) {
    res.send('Hello World :)');
})

app.listen(process.env.PORT, process.env.IP);


