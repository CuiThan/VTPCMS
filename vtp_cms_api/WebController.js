var express = require('express');
var Joi = require('joi');
var router = express.Router();
var bodyParser = require('body-parser');
var ValidateOrderStatus = require('../validation/order-status');
var VerifyToken = require('../auth/VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

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
module.exports = router;
