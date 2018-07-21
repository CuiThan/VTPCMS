var express = require('express');
var Joi = require('joi');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var ValidateOrderStatus = require('../validation/order-status');
var VerifyToken = require('../auth/VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../VTPCMS/public/images')
  },
  filename: function (req, file, cb) {
     console.log('file', file);
    cb(null, Date.now() + '.' + file.mimetype.split('/')[1])
  }
});

var mediaStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../VTPCMS/public/audios')
  },
  filename: function (req, file, cb) {
     console.log('file', file);
    cb(null, Date.now() + '.' + file.mimetype.split('/')[1])
  }
});

var exelStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, '../VTPCMS/public/xlsx')
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').slice(-1)[0])
   }
});

const upload = multer({ storage: storage });
const mediaUpoad = multer({ storage: mediaStorage });
const exelUpoad = multer({ storage: exelStorage });

var Services = require('../dao/services');


/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

//Services

router.post('/get-homepage', VerifyToken.verifyAppToken, function(req, res) {
   Services.find({ status: 1, displayOnHome : true }).sort({displayOrder: -1}).exec(function (err, services) {
      if (err) return res.status(500).send('Error on the server.');
      if (!services) return res.status(404).send('No user found.');

      res.status(200).send({ auth: true, data: services });
   });
});


router.post('/get-services-page', VerifyToken.verifyAppToken, function(req, res) {
   res.status(200).send({ auth: true, message: "get-services-page" });
});

router.post('/get-services-by-id', VerifyToken.verifyAppToken, function(req, resp) {
    if (req.body == undefined || Object.keys(req.body).length == 0)
    {
        resp.status(200).send('orderInfo is required!!!');
        return;
    }

    // err === null -> valid
    Joi.validate(JSON.stringify(req.body).toLowerCase(), ValidateOrderStatus, function (err, value) {
        if (err === null) {
            // var topicName = Setting.TOPIC_NAME_ORDER;
            // var kafkaKey = Setting.KAFKA_KEY;
            // var kafkaObject = new Object();
            // kafkaObject.type = APIType.PUSH_ORDER_STATUS;
            // kafkaObject.data = req.body;
            // var kafkaValue = JSON.stringify(kafkaObject).toLowerCase();
            //
            // var rs = new KafkaService();
            // rs.sendMessage([{topic: topicName,
            //     messages: kafkaValue,
            //     key: kafkaKey}], resp);
        }
        else {
            //errors
            err.status = "ValidateError";
            resp.status(200).send(err);
        };
    });
});

//Upload image

router.post('/upload_image', VerifyToken.verifyAppToken, upload.single('file'), function (req, res) {
   if(req.file){
      return res.status(200).send({ message: " Upload image success", error: false, filename: req.file.filename });
   }
   res.status(500).send({ message: "Can not connect to server", error: true });

});

router.post('/upload_media_file', VerifyToken.verifyAppToken, mediaUpoad.single('file'), function (req, res) {
   if(req.file){
      return res.status(200).send({ message: " Upload audio success", error: false, filename: req.file.filename });
   }
   res.status(500).send({ message: "Can not connect to server", error: true });

});

router.post('/upload_exel_file', VerifyToken.verifyAppToken, exelUpoad.single('file'), function (req, res) {
   if(req.file){
      return res.status(200).send({ message: " Upload audio success", error: false, filename: req.file.filename });
   }
   res.status(500).send({ message: "Can not connect to server", error: true });

});

module.exports = router;
