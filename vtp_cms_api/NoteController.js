var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var RegisterAgency = require('../dao/RegisterAgency');
var OfferPrice = require('../dao/OfferPrice');
var ConsultService = require('../dao/ConsultService');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_register_agency', verify.verifyAppToken, function (req, res) {
   RegisterAgency.find({}, function( err, agency) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: agency });
   })
});


router.post('/list_offer_price',  verify.verifyAppToken, function (req, res) {
   OfferPrice.find({}, function( err, offerPrice) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: offerPrice });
   })
});


router.post('/list_consult_service',  verify.verifyAppToken, function (req, res) {
   ConsultService.find({}, function( err, consultService) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: consultService });
   })
});

router.post('/generate',  verify.verifyAppToken, function (req, res) {
   for (var i = 0; i < 20; i++) {
      // RegisterAgency.create({
      //    fullName : 'Nguyen Van A' + i,
      //    email : i + '@gmail.com',
      //    phone : '0123456789',
      //    address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
      //    pesonalOrBusinessRegisterId : "003004005",
      //    issuedDate : new Date(),
      //    issuedPlace: "Hai Bà Trưng, Hà Nội",
      //    createdUserId : req.clientAppId,
      //    job: "Saler",
      //    registerAgencyAddress: "N2, Viettel Post",
      //    totalSquare: 300,
      //    length: 10,
      //    width: 30,
      //    height: 5,
      //    startDate: new Date(),
      //    note: ''
      // }, function(err, register){
      //    console.log('add register agency');
      // });
      ConsultService.create({
         fullName : 'Nguyen Van A' + i,
         email : i + '@gmail.com',
         phone : '0123456789',
         address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
         title: 'title' + i,
         content: 'content' + i,
         note: ''
      }, function(err, register){
         console.log('add consult service');
      })

      OfferPrice.create({
         fullName : 'Nguyen Van A' + i,
         email : i + '@gmail.com',
         phone : '0123456789',
         address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
         service: "Vận tải nội địa",
         unit: "Kiện",
         packageMaterial: "Thùng carton",
         length: 10,
         width: 30,
         height: 5,
         departurePlace: "Hà Nội",
         destinatonPlace: "TP HCM",
         timeTarget: 30,
         temperatureRequired: 25,
         priceRequired: 5000000,
         wareContent: "Đồ đông lạnh",
         note: ''
      }, function(err, register){
         console.log('add offer price');
      });
   }
});


module.exports = router;
