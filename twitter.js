var TwitterApi = require('node-twitter-api'),
    config = require('./config');
    
var twitter = new TwitterApi({
    consumerKey: config.twitterApiKey,
    consumerSecret: config.twitterSecretKey,
    callback: 'http://www.alanc.net/dummy'
});
console.log('a');
module.exports = twitter;
console.log('b');