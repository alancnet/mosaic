var express = require('express'),
    app = express(),
    port = process.env.PORT || 1337;


app.get('/test', function(req, res) {
    res.send('Hello World :)');
})

app.use(express.static('./www'));

app.listen(port);