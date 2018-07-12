var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var Service = require('../dao/services');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_all', verify.verifyAppToken, function (req, res) {
   let obj = req.body.serviceId == undefined ? {} : {_id: req.body.serviceId};
   // console.log(req.body);
   // console.log(obj);
   Service.find(obj, function (err, services) {
      console.log('line 15', services.length);
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      // if create banner success

      if(services.length == 1){
         Service.find({ _id: services[0].parentId }, function( err, banner){
            // console.error(err);
            if (err) return res.status(200).send({  message: "success", error: false, data: services, parent: null });
            else return res.status(200).send({ message: "success", error: false, data: services, parent:  banner[0]});
         })
      }
      else return res.status(200).send({ message: "success", error: false, data: services });

   })
})

router.post('/list_parent', verify.verifyAppToken, function (req, res) {
   Service.find({ parentId: 0 }).exec(function (err, services) {
      if (err) return res.status(500).send('Error on the server.');
      if (!services) return res.status(404).send('No user found.');

      res.status(200).send({ message: 'success', data: services });
   });
});

router.post('/list_child', verify.verifyAppToken, function (req, res) {
   if(req.body.parentServiceId == undefined){
      return res.status(200).send('Child service not found');
   }
   Service.find({ parentId: req.body.parentServiceId }).exec(function (err, services) {
      if (err) return res.status(500).send('Error on the server.');
      if (!services) return res.status(404).send('No user found.');

      res.status(200).send({ message: 'success', data: services });
   });
});

router.post('/search', verify.verifyAppToken, function(req, res){
   // console.log(req.body);
   var { name, status } = req.body;
   var searchQuery = {};

   if(status != undefined && status > 0){
      searchQuery.status = status;
   }
   if(name != undefined && name.trim() != '') {
      searchQuery.name = new RegExp(name.trim());
   }
   console.log(searchQuery);

   Service.find(searchQuery, function (err, services) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true, log: err });
      // if create banner success
      res.status(200).send({ message: "success", error: false, data: services });
   })
});

router.post('/create', verify.verifyAppToken, function (req, res) {
   var bodyRequest = req.body;
   Service.create({
      name : bodyRequest.name,
      logo : bodyRequest.logo,
      description : bodyRequest.description,
      parentId : bodyRequest.parentId,
      url : bodyRequest.url,
      displayOrder : bodyRequest.displayOrder,
      status : bodyRequest.status,
      displayOnHome : bodyRequest.displayOnHome,
      isHighLight : bodyRequest.isHighLight,
      isNews : bodyRequest.isNews,
      createdDate : new Date(),
      updatedDate : new Date(),
      createdUserId : req.clientAppId,
      updatedUserId : req.clientAppId
   }, function(err, service){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });

      // if create banner success
      res.status(200).send({ message: "Create service success", error: false, data:  service});
   })

})

router.post('/update', verify.verifyAppToken, function(req, res) {
   var bodyRequest = req.body;
   if(bodyRequest.serviceId == undefined){
      return res.status(200).json({ message: 'Service id is undefined', error: true});
   }
   Service.findOneAndUpdate({ _id:  bodyRequest.serviceId }, {
      name : bodyRequest.name,
      logo : bodyRequest.logo,
      description : bodyRequest.description,
      parentId : bodyRequest.parentId,
      url : bodyRequest.url,
      displayOrder : bodyRequest.displayOrder,
      status : bodyRequest.status,
      displayOnHome : bodyRequest.displayOnHome,
      isHighLight : bodyRequest.isHighLight,
      isNews : bodyRequest.isNews,
      updatedDate : new Date(),
      updatedUserId : req.clientAppId
   }, function( err, callback){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if (callback == null){
         res.status(200).send({ message: "Service not exist", error: true });
         return;
      }
      else {
         res.status(200).send({ message: "Update service success", error: false });
         return;
      }

   })
})


router.post('/delete', verify.verifyAppToken, function( req, res) {

   if(req.body.serviceId == undefined){
      return res.status(200).json({ message: 'Service id is undefined', error: true});
   }

   Service.findOneAndRemove({ _id: req.body.serviceId }, function (err, callback) {
      if(err) res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null) {
         res.status(200).send({ message: "Service not exist", error: true });
         return;
      }

      else {
         res.status(200).send({ message: "Delete service success", error: false });
         return;
      }

   })
})

module.exports =  router;
