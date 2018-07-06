var express = require('express');
var app = express();
var cors = require('cors');
var db = require('./db');
global.__root   = __dirname + '/';

app.get('/api', function (req, res) {
  res.status(200).send('API works.................');
});

app.use(cors());

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var WebController  = require(__root + 'vtp_cms_api/WebController');
app.use('/api/web', WebController);

var BannerController  = require(__root + 'vtp_cms_api/BannerController');
app.use('/api/banner', BannerController);

var BannerItemController  = require(__root + 'vtp_cms_api/BannerItemController');
app.use('/api/item-banner', BannerItemController);

var ServiceController  = require(__root + 'vtp_cms_api/ServiceController');
app.use('/api/service', ServiceController);

var PostController  = require(__root + 'vtp_cms_api/PostController');
app.use('/api/post', PostController);

var UserController  = require(__root + 'vtp_cms_api/UserController');
app.use('/api/user', UserController);

var CMSAPI = require(__root + 'vtp_cms_api/WebController');
app.use('/api/cms', CMSAPI);

var RadioAPI = require(__root + 'vtp_cms_api/RadioController');
app.use('/api/radio', RadioAPI);

module.exports = app;
