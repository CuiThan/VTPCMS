var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var Post = require('../dao/post');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/list_all', verify.verifyAppToken, function(req, res){

   let query = req.body.postId == undefined ? {} : {_id: req.body.postId};
   Post.find(query, function (err, banners) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true });

      // if create banner success
      res.status(200).send({ message: "success", error: false, data: banners });
   })
});

router.post('/create', verify.verifyAppToken, function (req, res) {
   var bodyRequest = req.body;
   console.log(bodyRequest.servicesId);
   Post.create({
      title : bodyRequest.title,
      content : bodyRequest.content,
      status : bodyRequest.status,
      thumbnailImage : bodyRequest.thumbnailImage,
      shortDescription : bodyRequest.shortDescription,
      description : bodyRequest.description,
      servicesId : bodyRequest.servicesId,
      publishDate : bodyRequest.publishDate,
      createdDate : new Date(),
      updatedDate : new Date(),
      createdUserId : req.clientAppId,
      updatedUserId : req.clientAppId
   }, function (err, callback) {
      if (err) return res.status(500).send({ message: "Can not connect to server", error: true, data: err });
      if (callback == null)
         res.status(200).send({ message: "error", error: true });
      else
         res.status(200).send({ message: "Create post success", error: false, data: callback});
   })
})

router.post('/update', verify.verifyAppToken, function (req, res) {
   var bodyRequest = req.body;
   console.log(bodyRequest.publishDate);
   if(bodyRequest._id == undefined){
      return res.status(200).json({ message: 'Post not found', error: true});
   }
   Post.findOneAndUpdate({ _id:  bodyRequest._id }, {
      title : bodyRequest.title,
      content : bodyRequest.content,
      status : bodyRequest.status,
      thumbnailImage : bodyRequest.thumbnailImage,
      shortDescription : bodyRequest.shortDescription,
      description : bodyRequest.description,
      servicesId : bodyRequest.servicesId,
      publishDate : new Date(bodyRequest.publishDate),
      updatedDate : new Date(),
      updatedUserId : req.clientAppId
   }, function( err, callback){
      if (err) return res.status(500).json({ message: "Can not connect to server", error: true });
      if (callback == null)
         return res.status(200).json({ message: "Post not exist", error: true });
      else
         return res.status(200).json({ message: "Update Post success", error: false });
   })
})

router.post('/delete', verify.verifyAppToken, function( req, res) {
   // console.log(req.body);
   Post.findOneAndRemove({ _id: req.body.postId }, function (err, callback) {
      if(err) res.status(500).send({ message: "Can not connect to server", error: true });
      if(callback == null)
         res.status(200).send({ message: "Post not exist", error: true });
      else
         res.status(200).send({ message: "Delete post success", error: false });
   })
})

module.exports = router;
