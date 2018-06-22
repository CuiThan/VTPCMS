var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var MyVTPAPI = require(__root + 'myvtp_api/MyVTPController');
app.use('/api/myvtp', MyVTPAPI);


module.exports = app;