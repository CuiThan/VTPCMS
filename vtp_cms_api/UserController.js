var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var User = require('../dao/User');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/list_all', verify.verifyAppToken, function(req, res){
   User.find({}, function (err, users) {
      if(err) res.status(500).send({ message: "Can not connect to server"});
      res.status(200).send(users);
   })
})

module.exports = router;
