var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var VerifyToken = require('../auth/VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var RadioSchedule = require('../dao/radioSchedule');
var Radio = require('../dao/radio');


/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


router.post('/get--active-radio',VerifyToken, function(req, resp) {
    /*RadioSchedule.findOne({ status: 1, publicDate : {$gte: Date.now} }, function (err, schedules) {
        if (err) return res.status(500).send('Error on the server.');
        if (!schedules) return res.status(404).send('No schedule found.');

        res.status(200).send({ status: "OK", schedule: schedules });
    });*/

    var activeRadio = {
        title: "Radio 1",
        radioUrl: "http://125.212.238.119:8001/"
    };
    res.status(200).send({ status: "OK", radio: activeRadio });
});

module.exports = router;