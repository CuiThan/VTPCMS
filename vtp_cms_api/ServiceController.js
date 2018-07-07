var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var Service = require('../dao/services');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_all', verify.verifyAppToken, function (req, res) {
   let obj = req.body.serviceId == undefined ? {} : {_id: req.body.serviceId};
   console.log(req.body);
   console.log(obj);
   Service.find(obj, function (err, banners) {
      console.log('line 15', banners.length);
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      // if create banner success

      if(banners.length == 1){
         Service.find({ _id: banners[0].parentId }, function( err, banner){
            // console.error(err);
            if (err) return res.status(200).send({  message: "success", error: false, data: banners, parent: null });
            else return res.status(200).send({ message: "success", error: false, data: banners, parent:  banner[0]});
         })
      }
      else return res.status(200).send({ message: "success", error: false, data: banners });

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
      return res.status(200).send('Service not found');
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
      if (err) return res.status(500).json({ message: "Can not connect to server", error: true });
      if (callback == null)
         res.status(200).json({ message: "Service not exist", error: true });
      else
         res.status(200).json({ message: "Update service success", error: false });
   })
})


router.post('/delete', verify.verifyAppToken, function( req, res) {
   Service.findOneAndRemove({ _id: req.body.serviceId }, function (err, callback) {
      if(err) res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null)
         res.status(200).send({ message: "Service not exist", error: true });
      else
         res.status(200).send({ message: "Delete service success", error: false });
   })
})

module.exports =  router;
