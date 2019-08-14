const express = require('express');
const app = express();
const path    = require("path");

app.set('port', 3000);
app.get('/', function (req, res) { res.sendFile(path.join(__dirname+'/index.html'));});

var topics = require('./routes/topics');
app.use('/topics', topics);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

app.listen(app.get('port'), function () {
    console.log( "Globe api on port " + app.get('port')  );
});
