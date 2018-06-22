var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var ClientApp = require('../client_app/ClientApp');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/gettoken', function(req, res) {

    if (req.body.appId == undefined)
    {
        res.status(200).send("AppId is required!!!");
        return;
    }
    if (req.body.secretKey == undefined)
    {
        res.status(200).send("SecretKey is required!!!");
        return;
    }

    ClientApp.findOne({ appId: req.body.appId }, function (err, clientApp) {
    if (err) return res.status(500).send('Error on the server.');
    if (!clientApp) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.secretKey, clientApp.secretKey);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: clientApp._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token });
  });

});

router.get('/cleartoken', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/registerapp', function(req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.secretKey, 8);

    ClientApp.create({
            appId : req.body.appId,
            secretKey : hashedPassword
  }, 
  function (err, clientApp) {
    if (err) return res.status(500).send(err);

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: clientApp._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).send({ auth: true, token: token });
  });

});

router.get('/me', VerifyToken, function(req, res, next) {
    ClientApp.findById(req.clientAppId, { secretKey: 0 }, function (err, clientApp) {
    if (err) return res.status(500).send("There was a problem finding the app.");
    if (!clientApp) return res.status(404).send("No app found.");
    res.status(200).send(clientApp);
  });

});

module.exports = router;