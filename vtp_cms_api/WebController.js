var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var VerifyToken = require('../auth/VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var ClientApp = require('../client_app/ClientApp');
var Setting = require('../common/Setting');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


router.post('/get-homepage',VerifyToken, function(req, resp) {
    if (req.body == undefined || Object.keys(req.body).length == 0)
    {
        resp.status(200).send('orderInfo is required!!!');
        return;
    }

    //resp.status(200).send({"status" : "OK", "msg" : "message received!!!"});

    // err === null -> valid
    Joi.validate(JSON.stringify(req.body).toLowerCase(), ValidateOrder, function (err, value) {
        if (err === null) {
            var topicName = Setting.TOPIC_NAME;
            var kafkaKey = Setting.KAFKA_KEY_ORDER;
            var kafkaObject = new Object();
            kafkaObject.type = APIType.PUSH_ORDER;
            kafkaObject.data = req.body;
            var kafkaValue = JSON.stringify(kafkaObject).toLowerCase();

            var rs = new KafkaService();
            rs.sendMessage([{topic: topicName,
                messages: kafkaValue,
                key: kafkaKey}], resp);
        }
        else {
            //error
            err.status = "ValidateError";
            resp.status(200).send(err);
        };
    });
});

router.post('/get-services',VerifyToken, function(req, resp) {
    if (req.body == undefined || Object.keys(req.body).length == 0)
    {
        resp.status(200).send('orderInfo is required!!!');
        return;
    }

    // err === null -> valid
    Joi.validate(JSON.stringify(req.body).toLowerCase(), ValidateOrderStatus, function (err, value) {
        if (err === null) {
            var topicName = Setting.TOPIC_NAME_ORDER;
            var kafkaKey = Setting.KAFKA_KEY;
            var kafkaObject = new Object();
            kafkaObject.type = APIType.PUSH_ORDER_STATUS;
            kafkaObject.data = req.body;
            var kafkaValue = JSON.stringify(kafkaObject).toLowerCase();

            var rs = new KafkaService();
            rs.sendMessage([{topic: topicName,
                messages: kafkaValue,
                key: kafkaKey}], resp);
        }
        else {
            //error
            err.status = "ValidateError";
            resp.status(200).send(err);
        };
    });
});

router.post('/get-services-by-id',VerifyToken, function(req, resp) {
    if (req.body == undefined || Object.keys(req.body).length == 0)
    {
        resp.status(200).send('orderInfo is required!!!');
        return;
    }

    // err === null -> valid
    Joi.validate(JSON.stringify(req.body).toLowerCase(), ValidateOrderStatus, function (err, value) {
        if (err === null) {
            var topicName = Setting.TOPIC_NAME_ORDER;
            var kafkaKey = Setting.KAFKA_KEY;
            var kafkaObject = new Object();
            kafkaObject.type = APIType.PUSH_ORDER_STATUS;
            kafkaObject.data = req.body;
            var kafkaValue = JSON.stringify(kafkaObject).toLowerCase();

            var rs = new KafkaService();
            rs.sendMessage([{topic: topicName,
                messages: kafkaValue,
                key: kafkaKey}], resp);
        }
        else {
            //error
            err.status = "ValidateError";
            resp.status(200).send(err);
        };
    });
});
module.exports = router;