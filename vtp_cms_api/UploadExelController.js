var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var UploadExel = require('../dao/upload-exel');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/create', verify.verifyAppToken, function (req, res) {
   console.log(req.body);
   UploadExel.create(req.body , function (err, cb) {
      if(err) return res.status(500).send({ error: true, log: err });
      res.status(200).send({error: false, message: "success", data: cb});
   })
})

router.post('/get_all', verify.verifyAppToken, function (req, res) {
   // req.body = { cus_id: '111111111111111111' }
   UploadExel.find().exec(function (err, cb) {
      if(err) return res.status(500).send({ error: true, log: err });
      res.status(200).send({error: false, message: "success", data: cb});
   })
})

router.post('/get_by_cus_id', verify.verifyAppToken, function (req, res) {
   // req.body = { cus_id: '111111111111111111' }
   if(req.body.cus_id == undefined) {
      return res.status(200).send({ error: true, message: "CusId is undefined" });
   }
   UploadExel.find({ cusId: req.body.cus_id }).exec(function (err, cb) {
      if(err) return res.status(500).send({ error: true, log: err });
      res.status(200).send({error: false, message: "success", data: cb});
   })
})

router.post('/get_by_id', verify.verifyAppToken, function (req, res) {
   // req.body = { id: '111111111111111111' }
   if(req.body.id == undefined) {
      return res.status(200).send({ error: true, message: "Id is undefined" });
   }
   UploadExel.find({ _id: req.body.id }).exec(function (err, cb) {
      if(err) return res.status(500).send({ error: true, log: err });
      res.status(200).send({error: false, message: "success", data: cb});
   })
})

module.exports = router;
