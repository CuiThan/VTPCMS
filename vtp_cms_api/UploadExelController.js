var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var xlsx = require('node-xlsx');
var verify = require('../auth/VerifyToken');
var UploadExel = require('../dao/upload-exel');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


var exelStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, '../VTPCMS/public/xlsx')
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').slice(-1)[0])
   }
});

// var domain = "http://localhost:3344";
var domain = "http://125.212.238.119:3344";

const exelUpoad = multer({ storage: exelStorage });
//EXPORT EXEL FILE
router.get('/export/:id', function(req, res) {
   if(req.params.id == undefined) {
      return res.status(400).send({ status: 400, error: true, message: "Id is undefined", data: null });
   }
   var exelData = [];

   UploadExel.findById(req.params.id).exec( function(err, data) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });

      exelData.push(data.header);
      let header = data.header;
      console.log(header);
      // Object.keys(header).forEach( k => {
      //    console.log(header[k]);
      // })
      // console.log(data.content);
      for (let i = 0; i < data.content.length; i++ ) {
         let rowExel = [];

         let row = data.content[i].data;
         // console.log(row);
         for (let j = 0; j < header.length; j++) {
            let childRow = [];
            childRow.push(row[header[j]]);
            rowExel.push(childRow);
         }

         // Object.keys(row).forEach(key => {
         //    let childRow = [];
         //    console.log(row[key]);
         //
         //    // Object.keys(header).forEach( k => {
         //    //    childRow.push(row[key][header[k]])
         //    // })
         //
         // });
         exelData.push(rowExel);
      }

      let buffer = xlsx.build([{name: "List User", data: exelData }]); // Returns a buffer
      // res.attachment('users.xlsx');
      let name = 'aaaa';
      let filename = `${name}.xlsx`;
      fs.writeFile(`public/xlsx/${filename}`, buffer, function (err) {
         if (err) return console.log(err);
         // else return res.render('index', {link: `/xlsx/${filename}`, name: filename});
         else return res.redirect(`/xlsx/${filename}`);
         // else return res.render('index');
      });
      // res.send(buffer);
      // res.status(200).send({status: 200, error: false, message: "success", data: cb});
   })
})
// UPLOAD FILE EXEL
router.post('/', exelUpoad.single('file'), function (req, res) {
   console.log(req.body);
   if(req.file) {

      // Parse a buffer
      const workSheetsFromBuffer = xlsx.parse(path.join(__root, 'public/xlsx/' + req.file.filename));
      // Parse a file
      const workSheetsFromFile = xlsx.parse(path.join(__root, 'public/xlsx/' + req.file.filename));
      // res.send(workSheetsFromFile);
      exelObject = [];
      // for (var i = 0; i < workSheetsFromFile.length; i++) {
      // start insert data
         var sheet = workSheetsFromFile[0].data;
         var header = sheet[0];
         // return res.status(200).send({ data: sheet })
         var list_content = [];
         for (var j = 1; j < sheet.length; j++) {
            var content = {};
            for (var k = 0; k < header.length; k++) {
               content[header[k]] = sheet[j][k];
            }
            list_content[j-1] = {
               index: j,
               order: content
            }
         }
         var obj = {
            header: sheet[0],
            content: list_content,
            cusId: "3",
            rowCount: sheet.length - 1,
            GUI_ID: "123456789",
            uploadTime: new Date()
         }
         
         exelObject.push(obj);
         // res.status(200).send({ data: obj });
      // }

      UploadExel.create(exelObject, function (err, cb) {
         if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
         return res.status(200).send({status: 200, error: false, message: "success", data: cb});
      })
      // res.status(200).send({ data: workSheetsFromFile });
   } else {
      res.status(500).send({ message: "Can not connect to server", error: true });
   }
})

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
