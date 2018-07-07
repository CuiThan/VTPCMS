var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var Banner = require('../dao/banner');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_all', verify.verifyAppToken, function(req, res){

   let obj = req.body.bannerId == undefined ? {} : {_id: req.body.bannerId};
   Banner.find(obj, function (err, banners) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });

      // if create banner success
      res.status(200).send({ message: "success", error: false, data: banners });
   })
});

router.post('', verify.verifyAppToken, function(req, res){
   var bodyRequest = req.body;
   Banner.create({
      bannerName: bodyRequest.bannerName,
      status : bodyRequest.status,
      backgroundRGB: bodyRequest.backgroundRGB,
      createdDate: new Date(),
      updatedDate : new Date(),
      createdUserId : req.clientAppId,
      updatedUserId : bodyRequest.clientAppId
   }, function(err, bannerObject){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });

      // if create banner success
      res.status(200).send({ message: "Create banner success", error: false, banner: bannerObject });
   })
})

router.put('', verify.verifyAppToken, function(req, res) {
   var bodyRequest = req.body;
   if(bodyRequest.bannerId == undefined){
      return res.status(200).send('Banner not found');
   }
   Banner.findOneAndUpdate({ _id:  bodyRequest.bannerId }, {
      bannerName: bodyRequest.bannerName,
      status : bodyRequest.status,
      backgroundRGB: bodyRequest.backgroundRGB,
      updatedDate : new Date(),
      updatedUserId : req.clientAppId
   }, function( err, callback){
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });
      if (callback == null)
         res.status(200).send({ message: "Banner not exist", error: true });
      else
         res.status(200).send({ message: "Update banner success", error: false });
   })
})


router.delete('', verify.verifyAppToken, function( req, res) {
   Banner.findOneAndRemove({ _id: req.body.bannerId }, function (err, callback) {
      if(err) res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null)
         res.status(200).send({ message: "Banner not exist", error: true });
      else
         res.status(200).send({ message: "Delete banner success", error: false });
   })
})

module.exports = router;
