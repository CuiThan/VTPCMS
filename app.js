var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var CMSAPI = require(__root + 'vtp_cms_api/WebController');
app.use('/api/cms', CMSAPI);

var RadioAPI = require(__root + 'vtp_cms_api/RadioController');
app.use('/api/radio', RadioAPI);

module.exports = app;