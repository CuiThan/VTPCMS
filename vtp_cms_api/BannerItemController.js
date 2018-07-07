var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var BannerItem = require('../dao/banner-item');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_all', verify.verifyAppToken, function(req, res){
   query = req.body.bannerItemId == undefined ? {} : { _id: req.body.bannerItemId };
   BannerItem.find(query, function (err, items){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      // if create banner item success
      res.status(200).send({ message: "success", error: false, data: items});
   })
})

router.post('', verify.verifyAppToken, function(req, res){

   var bodyRequest = req.body;
   BannerItem.create({
      bannerItemName: bodyRequest.bannerItemName,
      bannerId: bodyRequest.bannerId,
      status : bodyRequest.status,
      targetUrl : bodyRequest.targetUrl,
      imageUrl : bodyRequest.imageUrl,
      backgroundRGB: bodyRequest.backgroundRGB,
      isDefault: bodyRequest.isDefault,
      priority: bodyRequest.priority,
      startDate: new Date(bodyRequest.startDate),
      endDate: new Date(bodyRequest.endDate),
      updatedDate : new Date(),
      createdDate: new Date(),
      createdUserId : req.clientAppId,
      updatedUserId : req.clientAppId
   }, function(err, bannerItemObject){

      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });

      // if create banner item success
      res.status(200).send({ message: "Create banner item success", error: false, banner: bannerItemObject });
   })
});

router.put('', verify.verifyAppToken, function(req, res) {
   var bodyRequest = req.body;
   if(bodyRequest.bannerItemId == undefined){
      return res.status(200).send({message: "BannerItemId not found", error: true });
   }
   BannerItem.findOneAndUpdate({ _id:  bodyRequest.bannerItemId }, {
      bannerItemName: bodyRequest.bannerItemName,
      bannerId: bodyRequest.bannerId,
      status : bodyRequest.status,
      targetUrl : bodyRequest.targetUrl,
      imageUrl : bodyRequest.imageUrl,
      backgroundRGB: bodyRequest.backgroundRGB,
      isDefault: bodyRequest.isDefault,
      priority: bodyRequest.priority,
      startDate: new Date(bodyRequest.startDate),
      endDate: new Date(bodyRequest.endDate),
      updatedDate : new Date(),
      updatedUserId : req.clientAppId
   }, function( err, callback){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null)
         res.status(200).send({ message: "Banner item not exist", error: true });
      else
         res.status(200).send({ message: "Update banner item success", error: false });
   })
})


router.delete('', verify.verifyAppToken, function( req, res) {
   var bodyRequest = req.body;
   if(bodyRequest.bannerItemId == undefined){
      return res.status(200).send({message: "BannerItemId not found", error: true });
   }

   BannerItem.findOneAndRemove({ _id: bodyRequest.bannerItemId }, function(err, callback) {
      if(err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null)
         res.status(200).send({ message: "Banner item not exist", error: true });
      else
         res.status(200).send({ message: "Delete banner item success", error: false });
   })
})

module.exports = router;
