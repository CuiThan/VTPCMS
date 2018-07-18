var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var UploadExel = require('../dao/upload-exel');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/create', function (req, res) {
   // console.log(req.body);
   UploadExel.create(req.body , function (err, cb) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
      res.status(200).send({status: 200, error: false, message: "success", data: cb});
   })
})

router.post('/get_all', function (req, res) {
   // req.body = { cus_id: '111111111111111111' }
   UploadExel.find().exec(function (err, cb) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
      res.status(200).send({ status: 200, error: false, message: "success", data: cb});
   })
})

router.post('/get_by_cus_id', function (req, res) {
   // req.body = { cus_id: '111111111111111111' }
   if(req.body.cus_id == undefined) {
      return res.status(400).send({ status: 400, error: true, message: "CusId is undefined", data: null });
   }
   UploadExel.find({ cusId: req.body.cus_id }).exec(function (err, cb) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
      res.status(200).send({status: 200, error: false, message: "success", data: cb.length ? cb : null});
   })
})

router.post('/get_by_id', function (req, res) {
   // req.body = { id: '111111111111111111' }
   if(req.body.id == undefined) {
      return res.status(400).send({ status: 400, error: true, message: "Id is undefined", data: null });
   }
   UploadExel.find({ _id: req.body.id }).exec(function (err, cb) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
      res.status(200).send({ status: 200, error: false, message: "success", data: cb.length ? cb : null});
   })
})

module.exports = router;
