var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var RegisterAgency = require('../dao/register-agency');
var OfferPrice = require('../dao/offer-price');
var ConsultService = require('../dao/consult-service');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


// **************************REGISTER AGENCY**********************************
router.post('/list_register_agency', verify.verifyAppToken, function (req, res) {
   RegisterAgency.find().exec(function( err, agency) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: agency });
   })
});

router.post('/get_register_agency_by_id',  verify.verifyAppToken, function (req, res) {
   if(req.body.registerAgencyId == undefined){
      return res.status(200).send({ message: 'Register Agency Id is undefined', error: true });
   }

   RegisterAgency.findOne({_id: req.body.registerAgencyId}).exec(function (err, agency) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(agency == null) return res.status(200).send({ message: "Agency not exist", error: true });
      // if get register agency success
      res.status(200).send({ message: "success", error: false, data: agency });
   })
});

router.post('/register_agency_update',  verify.verifyAppToken, function (req, res) {
   console.log(req.body.note);
   if(req.body._id == undefined){
      return res.status(200).send({ message: 'Register Agency Id is undefined', error: true });
   }

   RegisterAgency.findOneAndUpdate({_id: req.body._id}, { status: req.body.status, note: req.body.note }).exec(function (err, agency) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(agency == null) return res.status(200).send({ message: "Agency not exist", error: true });
      // if get register agency success
      res.status(200).send({ message: "success", error: false, data: agency });
   })
});

router.post('/register_agency_search', verify.verifyAppToken, function(req, res){
   var { fullName, address, job, registerAgencyAddress, status  } = req.body;
   console.log(req.body);
   var searchQuery = {};
   if(status != undefined && status > 0){
      searchQuery.status = status;
   }
   if(address != undefined && address.trim() != '') {
      searchQuery.address = new RegExp(address.trim());
   }

   if(fullName != undefined && fullName.trim() != '') {
      searchQuery.fullName = new RegExp(fullName.trim());
   }

   if(job != undefined && job.trim() != '') {
      searchQuery.job = new RegExp(job.trim());
   }

   if(registerAgencyAddress != undefined && registerAgencyAddress.trim() != '') {
      searchQuery.registerAgencyAddress = new RegExp(registerAgencyAddress.trim());
   }

   console.log(searchQuery);

   RegisterAgency.find(searchQuery).exec(function (err, radio) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true, log: err });

      // if find radio success
      res.status(200).send({ message: "success", error: false, data: radio });
   })
});

// **************************OFFER PRICE**********************************
router.post('/list_offer_price',  verify.verifyAppToken, function (req, res) {
   OfferPrice.find().exec(function( err, offerPrice) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: offerPrice });
   })
});

router.post('/get_offer_price_by_id',  verify.verifyAppToken, function (req, res) {
   if(req.body.offerPriceId == undefined){
      return res.status(200).send({ message: 'Offer Price Id is undefined', error: true });
   }

   OfferPrice.findOne({_id: req.body.offerPriceId}).exec(function (err, offer) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(offer == null) return res.status(200).send({ message: "Radio not exist", error: true });
      // if get offer price success
      res.status(200).send({ message: "success", error: false, data: offer });
   })
});

router.post('/offer_price_update',  verify.verifyAppToken, function (req, res) {
   console.log(req.body.note);
   if(req.body._id == undefined){
      return res.status(200).send({ message: 'Offer Price Id is undefined', error: true });
   }

   OfferPrice.findOneAndUpdate({_id: req.body._id}, { status: req.body.status, note: req.body.note }).exec(function (err, offer) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(offer == null) return res.status(200).send({ message: "Offer Price not exist", error: true });
      // if get offer price success
      res.status(200).send({ message: "success", error: false, data: offer });
   })
});


router.post('/offer_price_search', verify.verifyAppToken, function(req, res){
   var { fullName, status, departurePlace, destinationPlace, service } = req.body;
   console.log(req.body);
   var searchQuery = {};
   if(status != undefined && status > 0){
      searchQuery.status = status;
   }
   if(fullName != undefined && fullName.trim() != '') {
      searchQuery.fullName = new RegExp(fullName.trim());
   }

   if(departurePlace != undefined && departurePlace.trim() != '') {
      searchQuery.departurePlace = new RegExp(departurePlace.trim());
   }

   if(destinationPlace != undefined && destinationPlace.trim() != '') {
      searchQuery.destinationPlace = new RegExp(destinationPlace.trim());
   }

   if(service != undefined && service.trim() != '') {
      searchQuery.service = new RegExp(service.trim());
   }


   console.log(searchQuery);

   OfferPrice.find(searchQuery).exec(function (err, offerPrice) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true, log: err });

      // if find offer price success
      res.status(200).send({ message: "success", error: false, data: offerPrice });
   })
});

// ************************** CONSULT SERVICE **********************************

router.post('/list_consult_service',  verify.verifyAppToken, function (req, res) {
   ConsultService.find().exec(function( err, consultService) {
      if(err) return res.status(500).send({ message: 'Can not connect to server', error: true });
      res.status(200).send({ message: "success", error: false, data: consultService });
   })
});

router.post('/get_consult_service_by_id',  verify.verifyAppToken, function (req, res) {
   if(req.body.consultServiceId == undefined){
      return res.status(200).send({ message: 'Consult Service Id is undefined', error: true });
   }

   ConsultService.findOne({_id: req.body.consultServiceId}).exec(function (err, consultService) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(consultService == null) return res.status(200).send({ message: "Consult service not exist", error: true });
      // if get consult service success
      res.status(200).send({ message: "success", error: false, data: consultService });
   })
});

router.post('/consult_service_update',  verify.verifyAppToken, function (req, res) {
   console.log(req.body.note);
   if(req.body._id == undefined){
      return res.status(200).send({ message: 'Consult Service Id is undefined', error: true });
   }

   ConsultService.findOneAndUpdate({_id: req.body._id}, { status: req.body.status, note: req.body.note }).exec(function (err, consultService) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(consultService == null) return res.status(200).send({ message: "Consult service not exist", error: true });
      // if get consult service success
      res.status(200).send({ message: "success", error: false, data: consultService });
   })
});

router.post('/consult_service_search', verify.verifyAppToken, function(req, res){
   var { fullName, phone, title, status } = req.body;
   console.log(req.body);
   var searchQuery = {};
   if(status != undefined && status > 0){
      searchQuery.status = status;
   }
   if(fullName != undefined && fullName.trim() != '') {
      searchQuery.fullName = new RegExp(fullName.trim());
   }

   if(phone != undefined && phone.trim() != '') {
      searchQuery.phone = new RegExp(phone.trim());
   }

   if(title != undefined && title.trim() != '') {
      searchQuery.title = new RegExp(title.trim());
   }

   console.log(searchQuery);

   ConsultService.find(searchQuery).exec(function (err, consult) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true, log: err });

      // if find consult success
      res.status(200).send({ message: "success", error: false, data: consult });
   })
});

router.post('/generate',  verify.verifyAppToken, function (req, res) {
   for (var i = 0; i < 20; i++) {
      RegisterAgency.create({
         fullName : 'Nguyen Van A' + i,
         email : i + '@gmail.com',
         phone : '0123456789',
         address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
         pesonalOrBusinessRegisterId : "003004005",
         issuedDate : new Date(),
         issuedPlace: "Hai Bà Trưng, Hà Nội",
         createdUserId : req.clientAppId,
         job: "Saler",
         registerAgencyAddress: "N2, Viettel Post",
         totalSquare: 300,
         length: 10,
         width: 30,
         height: 5,
         startDate: new Date(),
         note: '',
         status: 0
      }, function(err, register){
         console.log('add register agency');
      });
      ConsultService.create({
         fullName : 'Nguyen Van A' + i,
         email : i + '@gmail.com',
         phone : '0123456789',
         address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
         title: 'title' + i,
         content: 'content' + i,
         note: '',
         status: 0
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
         destinationPlace: "TP HCM",
         timeTarget: 30,
         temperatureRequired: 25,
         priceRequired: 5000000,
         wareContent: "Đồ đông lạnh",
         note: '',
         status: 0
      }, function(err, register){
         console.log('add offer price');
      });
   }
});

router.post('/update',  verify.verifyAppToken, function (req, res) {
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
      // ConsultService.create({
      //    fullName : 'Nguyen Van A' + i,
      //    email : i + '@gmail.com',
      //    phone : '0123456789',
      //    address : i + 'Minh Khai, Hai Bà Trưng, Hà Nội',
      //    title: 'title' + i,
      //    content: 'content' + i,
      //    note: ''
      // }, function(err, register){
      //    console.log('add consult service');
      // })

      // OfferPrice.findOneAndUpdate({ fullName : 'Nguyen Van A' + i }, { status: 0 }, function(err, register){
      //    console.log('update offer price');
      // });
   }

   OfferPrice.findOneAndUpdate({ fullName : 'Nguyen Van A1'  }, { new: true }, { $set : { other: 0 } }, function(err, register){
      console.log('update offer price');
      if(err) {
         return res.status(500).send({ err: err })
      } else {
         res.status(200).send({ data: register })
      }
   });
});


module.exports = router;
