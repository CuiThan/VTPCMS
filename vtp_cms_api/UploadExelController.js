var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var axios = require('axios');
var multer = require('multer');
var path = require('path');
var xlsx = require('node-xlsx');
var schedule = require('node-schedule');

var verify = require('../auth/VerifyToken');
var UploadExel = require('../dao/upload-exel');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const NLP_URL  = "http://address-address.oc.viettelpost.vn/parser";
const GetOrderPriceUrl = "https://api.viettelpost.vn/api/tmdt/getPrice";
const InsertOrderUrl = "https://api.viettelpost.vn/api/tmdt/InsertOrder";

// var domain = "http://localhost:3344";
var domain = "http://125.212.238.119:3344";



function delay() {
   return new Promise( resolve => setTimeout(resolve, 300))
}

function formatDateTime() {
   let date = new Date();
   let month = date.getMonth() + 1,
      day = date.getDate(),
      hour = date.getHours(),
      minute = date.getMinutes(),
      second = date.getSeconds();
   let dateFormat = ( day < 10 ? '0' + day : day ) + '/'
                     + ( month < 10 ? '0' + month : month ) + '/'
                     + date.getFullYear() + ' '
                     + ( hour < 10 ? '0' + hour : hour )+ ':'
                     + ( minute < 10 ? '0' + minute : minute ) + ':'
                     + ( second < 10 ? '0' + second : second );

   return dateFormat;
}


//  SCHDEULE CHECK ORDER
var j = schedule.scheduleJob('*/1 * * * *', function(){
   console.log('Start check order');
   checkOrderCronJob();
});

// TEST CHECK ORDER
// router.post('/test-check-order', function (req, res) {
function checkOrderCronJob() {
   let responseObject = [];
   // console.log(req.headers.token);
   let token = "";
   let ListFileChanged = [];
   axios.post("https://api.viettelpost.vn/api/user/Login", {
      "USERNAME": "nguyenthic@gmail.com",
      "PASSWORD" : "123456",
      "SOURCE" : 0
   })
   .then( loginResponse => {
      token = loginResponse.data.TokenKey;
      return UploadExel.find({ status: { $in: ["Change",  "Uploaded"] }}).exec()
   })
   .then( listFile => {
      if (listFile) {
         ListFileChanged = listFile;
         return UploadExel.updateMany({ status: { $in: ["Change",  "Uploaded"] }}, { $set: { status: "Processing" } } ).exec()
         // return UploadExel.find({ status: { $in: ["Change",  "Uploaded"] }} ).exec()
      }
      //if no file changed
      return res.status(200).send({ status: 200, error: true, message: "no file changed", data: null });
   })
   .then( updateResult => {
      console.log(updateResult);
      if (updateResult) {
         return UploadExel.find({ status: "Processing" }).exec();
      }

      //if update file status fail
      return res.status(200).send({ status: 200, error: true, message: "update file status fail", data: null });
   })
   .then( processingFile => {
      if (processingFile) {
         console.log(processingFile.length);
         checkOrderToInsert(processingFile, token);
         // return res.status(200).send({ status: 200, error: true, message: "success", data: processingFile });
      }

      //if has no processing file
      // return res.status(200).send({ status: 200, error: true, message: "no processing file", data: null });
   })
   .catch( err => {
      console.log(err);
      return res.status(500).send({ status: 500, error: true, message: "error", data: null, log: err });
   })

}
// })

async function checkOrderToInsert(array, token) {
   // check each file one by one
   for (let item in array) {
      console.log(item + '. ' + array[item]._id);
      await checkListOrder(array[item], token);
      console.log('------------------------------------------');
   }
   console.log('Done!!!!!!!!!!!');
}

async function checkListOrder(list, token) {

   let list_order_id = list._id;
   // try {
      let inventory = list.inventory;
      list = list.content;

      //add address to check NLP
      let listReceiverAddress = [];
      list.map( function(item) {
         listReceiverAddress.push(item.order.DIACHI_KHNHAN);
      })
      // let NLPResult = await axios.post(NLP_URL, { address: listReceiverAddress});
      // console.log(NLPResult);
      let len = list.length;
      for ( let item of list ){
         len = len -1;
         // check each order item one by one
         await checkOrderItem(item, len, inventory, list_order_id, token);
      }

      // after update all order item of file, set status = completed
      UploadExel.findByIdAndUpdate(list_order_id, { $set: { "status": "Completed" } }, function (err, callback) {
         return new Promise( (resolve, reject) => {
            if (err || !callback) return reject('update file status fail')
            return resolve('check order in file complete')
         })
            // if (err || !callback) console.log('update file status fail')
            // else console.log('check order in file complete')

      })

      // let prommisesItem = list.map(checkOrderItem, {inventory, list_order_id});
      // await Promise.all(prommisesItem);
   // } catch (e) {
   //    console.log(e);
   // } finally {
   //    console.log(`end check list order ${list_order_id}`);
   // }

}

// check order item from NLP -> get price -> insert
function checkOrderItem(item, len, inventory, list_order_id, token) {
   if (item.status != "Change" && item.status != "New") {
      return new Promise( resolve => {
         resolve('ok');
      });
   }

   else return new Promise( (resolve, reject) => {
      console.log(`${item.index}. ${item.status}`);
      // return resolve(11);

      // let order_info = {
      //    "SENDER_PROVINCE": Number(inventory.PROVINCE_ID),
      //    "SENDER_DISTRICT": Number(inventory.DISTRICT_ID),
      //    "RECEIVER_PROVINCE": 35,
      //    "RECEIVER_DISTRICT": 403,
      //    "PRODUCT_TYPE": "HH",
      //    "ORDER_SERVICE": item.order.DICH_VU.split('-')[0].trim(),
      //    "ORDER_SERVICE_ADD": item.order.DICH_VU_KHAC,
      //    "PRODUCT_WEIGHT": item.order.TRONG_LUONG_GRAM,
      //    "PRODUCT_PRICE": item.order.TRI_GIA_HANG,
      //    "MONEY_COLLECTION": item.order.TIEN_THU_HO,
      //    "PRODUCT_QUANTITY": 1,
      //    "NATIONAL_TYPE": 1
      // };
      //
      // axios.post(GetOrderPriceUrl, order_info)
      let NLPResponse = {};

      // start check order item of file
      axios.post(NLP_URL, { addresss: [item.order.DIACHI_KHNHAN] })
      .then(  checkNLP => {
         // console.log(checkNLP.data);
         NLPResponse = checkNLP.data[0]
         if (NLPResponse.province.code == 0 && NLPResponse.commune.code == 0 && NLPResponse.district.code == 0) {
            console.log('NLP fail');
            // NLP error
            UploadExel.findOneAndUpdate(
               { "_id": list_order_id, "content.index" : item.index  },
               { $set: { "content.$.status" : "NLPError"  } },
               function (err, cb) {
                  return resolve('ok')
               }
            )
         } else {
            console.log('NLP success');
            // NLP success and validate price
            let order_info = {
               "SENDER_PROVINCE": Number(inventory.PROVINCE_ID),
               "SENDER_DISTRICT": Number(inventory.DISTRICT_ID),
               "RECEIVER_PROVINCE": NLPResponse.province.code,
               "RECEIVER_DISTRICT": NLPResponse.district.code,
               "PRODUCT_TYPE": "HH",
               "ORDER_SERVICE": item.order.DICH_VU.split('-')[0].trim(),
               "ORDER_SERVICE_ADD": item.order.DICH_VU_KHAC,
               "PRODUCT_WEIGHT": item.order.TRONG_LUONG_GRAM,
               "PRODUCT_PRICE": item.order.TRI_GIA_HANG,
               "MONEY_COLLECTION": item.order.TIEN_THU_HO,
               "PRODUCT_QUANTITY": 1,
               "NATIONAL_TYPE": 1
            };
            return axios.post(GetOrderPriceUrl, order_info);
         }
      })
      .then( getPriceResponse => {
         // console.log(getPriceResponse.data);
         if (getPriceResponse.error) {
            // order is not validate and update status to "validate_failed"
            console.log('validate fail');
            UploadExel.findOneAndUpdate(
               { "_id": list_order_id, "content.index" : item.index  },
               { $set: { "content.$.status" : "ValidateEror"  } },
               function (err, cb) {
                  return resolve('ok');
               }
            )
         } else {

            //order validate and continue insert order
            console.log('validate success');
            let order_insert = {
               "ORDER_NUMBER": item.order.MA_DON_HANG ? item.order.MA_DON_HANG : "",
               "GROUPADDRESS_ID": inventory.GROUPADDRESS_ID,
               "CUS_ID": inventory.CUS_ID,
               "DELIVERY_DATE": formatDateTime(),
               "SENDER_FULLNAME": inventory.NAME,
               "SENDER_ADDRESS": inventory.ADDRESS,
               "SENDER_PHONE": inventory.PHONE,
               "SENDER_EMAIL": "c.phamquang@e-comservice.com",
               "SENDER_WARD": Number(inventory.WARDS_ID),
               "SENDER_DISTRICT": Number(inventory.DISTRICT_ID),
               "SENDER_PROVINCE": Number(inventory.PROVINCE_ID),
               "SENDER_LATITUDE": 0,
               "SENDER_LONGITUDE": 0,
               "RECEIVER_FULLNAME": item.order.TEN_NGUOI_NHAN,
               "RECEIVER_ADDRESS": item.order.DIACHI_KHNHAN,
               "RECEIVER_PHONE": item.order.DIEN_THOAI_KHNHAN,
               "RECEIVER_EMAIL": "",
               "RECEIVER_WARD": NLPResponse.commune.code,
               "RECEIVER_DISTRICT": NLPResponse.district.code,
               "RECEIVER_PROVINCE": NLPResponse.province.code,
               "RECEIVER_LATITUDE": 0,
               "RECEIVER_LONGITUDE": 0,
               "PRODUCT_NAME": item.order.NOI_DUNG_HANG_HOA,
               "PRODUCT_DESCRIPTION": "",
               "PRODUCT_QUANTITY": 1,
               "PRODUCT_PRICE": item.order.TRI_GIA_HANG,
               "PRODUCT_WEIGHT": item.order.TRONG_LUONG_GRAM,
               "PRODUCT_TYPE": "HH",
               "ORDER_PAYMENT": item.order.NGUOI_NHAN_TRA_CUOC.split('-')[0].trim(),
               "ORDER_SERVICE": item.order.DICH_VU.split('-')[0].trim(),
               "ORDER_SERVICE_ADD": item.order.DICH_VU_KHAC ? item.order.DICH_VU_KHAC : "",
               "ORDER_VOUCHER": 0,
               "ORDER_NOTE": "",
               "MONEY_COLLECTION": item.order.TIEN_THU_HO,
               "MONEY_TOTALFEE": 0,
               "MONEY_FEECOD": 0,
               "MONEY_FEEVAS": 0,
               "MONEY_FEEINSURRANCE": 0,
               "MONEY_FEE": 0,
               "MONEY_FEEOTHER": 0,
               "MONEY_TOTALVAT": 0,
               "MONEY_TOTAL": 0
            }
            // console.log(order_insert);
            return axios.post(InsertOrderUrl, order_insert, { headers: { "token": token } } )

         }
      })
      .then( insertResponse => {
         console.log(insertResponse.data);
         if (insertResponse.data.status == 200 && !insertResponse.data.error ) {
            console.log('insert success');
            // insert order success
            UploadExel.findOneAndUpdate(
               { "_id": list_order_id, "content.index" : item.index  },
               { $set: { "content.$.status" : "Completed"  } },
               function (err, cb) {
                  return resolve('ok');
               }
            )
         } else {
            console.log('insert fail');
            //insert order fail
            UploadExel.findOneAndUpdate(
               { "_id": list_order_id, "content.index" : item.index  },
               { $set: { "content.$.status" : "CreateOrderError"  } },
               function (err, cb) {
                  return resolve('ok');
               }
            )
         }

      })
      .catch( err => {
         reject(err);
      })


   })
}

// UPLOAD FILE EXEL
var exelStorage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, '../VTPCMS/public/xlsx')
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '.' + file.originalname.split('.').slice(-1)[0])
   }
});

const exelUpoad = multer({ storage: exelStorage });

router.post('/upload', exelUpoad.single('file'), function (req, res) {
   // console.log(JSON.parse(inventory));
   // console.log(req.body);
   if (req.body.inventory == undefined) {
      return res.status(400).send({ status: 400, error: true, message: "Inventory is undefined", data: null });
   }
   var { inventory } = req.body;
   inventory = JSON.parse(inventory);
   if(req.file) {
      // console.log(req.file);

      // Parse a buffer
      const workSheetsFromBuffer = xlsx.parse(path.join(__root, 'public/xlsx/' + req.file.filename));
      // Parse a file
      const workSheetsFromFile = xlsx.parse(path.join(__root, 'public/xlsx/' + req.file.filename));

      exelObject = [];

      // get data from 1st sheet
      var sheet = workSheetsFromFile[0].data;

      //get column name correspond to 1st row of 1st sheet
      var header = sheet[0];

      var list_row_data = [];

      // add data of row to array
      for (var j = 1; j < sheet.length; j++) {
         var row_data = {};
         for (var k = 0; k < header.length; k++) {
            row_data[header[k]] = sheet[j][k];
         }

         list_row_data[j-1] = {
            index: j,
            status: "New",
            order: row_data
         }
      }
      // console.log(inventory);
      // data structure of row
      var obj = {
         "header": sheet[0],
         "inventory": inventory,
         "content": list_row_data,
         "cusId": inventory.CUS_ID,
         "rowCount": sheet.length - 1,
         GUI_ID: inventory.GUI_ID,
         "uploadTime": new Date(),
         "fileName": req.file.filename,
         "originalName": req.file.originalname,
         status: 'Uploaded'
      }
      // complete parse all row to object
      exelObject.push(obj);
      // }

      UploadExel.create(exelObject, function (err, cb) {
         if(err) return res.status(500).send({ status: 500, error: true, message: "Can not upload file exel", data: null });
         return res.status(200).send({status: 200, error: false, message: "Upload file exel success", data: null});
      })

   } else {
      res.status(400).send({ status:400, message: "File is not choosen", error: true });
   }
})




// router.post('/create', function (req, res) {
//    UploadExel.create(req.body , function (err, cb) {
//       if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });
//       res.status(200).send({status: 200, error: false, message: "success", data: cb});
//    })
// })

//EXPORT EXEL FILE
router.get('/export/:id', function(req, res) {
   if(req.params.id == undefined) {
      return res.status(400).send({ status: 400, error: true, message: "Id is undefined", data: null });
   }
   var exelData = [];

   UploadExel.findById(req.params.id).exec( function(err, data) {
      if(err) return res.status(500).send({ status: 500, error: true, message: "Can not connect to server or query error", data: null });

      let header = data.header;
      // push column name
      exelData.push(header);

      // console.log(header);
      // Object.keys(header).forEach( k => {
      //    console.log(header[k]);
      // })
      for (let i = 0; i < data.content.length; i++ ) {
         let rowExel = [];
         let row = data.content[i].data;

         // add data to row and correspond to column
         for (let j = 0; j < header.length; j++) {
            let childRow = [];
            childRow.push(row[header[j]]);
            rowExel.push(childRow);
         }

         // add all row to excel file
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



router.post('/edit_order_item', function (req, res) {
   // console.log('haha');

   let { cus_id, GUI_ID, list_order } = req.body;

   if(cus_id == undefined){
      return res.status(400).send({status: 400, message: 'CusId is undefined', error: true, data: null });
   }

   if(GUI_ID == undefined){
      return res.status(400).send({status: 400, message: 'GUI_ID is undefined', error: true, data: null });
   }

   if(list_order == undefined){
      return res.status(400).send({status: 400, message: 'List order is undefined', error: true, data: null });
   }

   let list_index = [];
   for ( let i in list_order) {
      list_index.push(list_order[i].index)
   }

   // console.log(list_index);
   // { "_id": list_order_id, "content.index" : item.index  },
   // { $set: { "content.$.status" : "Completed"  } },
   // UploadExel.update(
   //    { "cusId": cus_id, "GUI_ID": GUI_ID, "content.index" : { $in: list_index } },
   //    { $set: {  status: "Change", "content.$.status": "Change"  }  }
   // ).exec()
   // .then( updateResponse => {
   //    console.log(updateResponse);
   // })
   // .catch( err => {
   //    console.log(err);
   // })

   updateOrderItem(list_order, cus_id, GUI_ID);
   // console.log("updateStatus = ",updateStatus);
   // if (updateStatus == "ok") {
      //after update status for all order need update -> update status for file exel
   UploadExel.update(
      { "cusId": cus_id, "GUI_ID": GUI_ID },
      { $set: {  "status": "Change"  }  }
   ).then( updateItemResponse =>{
      console.log('updateresponse', updateItemResponse);
      if (updateItemResponse) {
         return res.status(200).send({status: 200, message: 'upload list order success and waiting for worker response', error: true, data: null });
      }
      return res.status(500).send({status: 500, message: 'has error when update order item, please try do it', error: true, data: null });
   })
   .catch(err => {
      console.log(err);
      return res.status(500).send({status: 500, message: 'has error when update order item, please try do it', error: true, data: null });
   })
    // else {
      // res.status(500).send({status: 500, message: 'has error when update order item, please try do it', error: true, data: null });
   // }



});

async function updateOrderItem(list_order, cus_id, GUI_ID) {
   for (let item in list_order) {
      await new Promise( (resolve, reject) => {
         UploadExel.update(
            { "cusId": cus_id, "GUI_ID": GUI_ID, "content.index" : list_order[item].index },
            { $set: {
               "content.$.status": "Change",
               "content.$.order.DICH_VU_KHAC": list_order[item].ORDER_SERVICE_ADD,
               "content.$.order.DICH_VU": list_order[item].ORDER_SERVICE,
               "content.$.order.TEN_NGUOI_NHAN": list_order[item].RECEIVER_FULLNAME,
               "content.$.order.DIACHI_KHNHAN": list_order[item].RECEIVER_ADDRESS,
               "content.$.order.DIEN_THOAI_KHNHAN": list_order[item].RECEIVER_PHONE,
               "content.$.order.NOI_DUNG_HANG_HOA": list_order[item].PRODUCT_NAME,
               "content.$.order.TRI_GIA_HANG": list_order[item].PRODUCT_PRICE,
               "content.$.order.TRONG_LUONG_GRAM": list_order[item].PRODUCT_WEIGHT,
               "content.$.order.TIEN_THU_HO": list_order[item].MONEY_COLLECTION,
            }}
         ).then( (updateItemResponse) =>{
            // console.log('err', err);
            console.log('response', updateItemResponse);
            resolve();
            // if (!err) {
            //    return resolve('ok');
            // } else return reject('exit');
         }).catch( err => {
            reject(err);
         })
      })
   }
}

router.post('/get_detail', function (req, res) {
   // req.body = { id: '111111111111111111' }
   const { cus_id, GUI_ID, page_size, page_index } = req.body
   if(cus_id == undefined){
      return res.status(400).send({status: 400, message: 'CusId is undefined', error: true, data: null });
   }

   if(GUI_ID == undefined){
      return res.status(400).send({status: 400, message: 'GUI_ID is undefined', error: true, data: null });
   }

   if(page_size == undefined){
      return res.status(400).send({status: 400, message: 'Page size is undefined', error: true, data: null });
   }

   if(page_index == undefined){
      return res.status(400).send({status: 400, message: 'Page index is undefined', error: true, data: null });
   }

   let NLPError = 0, ValidateError = 0, CreateOrderError = 0, Completed = 0, New = 0, Change = 0, Processing = 0;
   let ListNLPError = [], ListValidateError = [], ListCreateOrderError = [], ListCompleted = [], ListNew = [], ListChange = [];


   UploadExel.findOne({ cusId: cus_id, GUI_ID: GUI_ID }, function(err, history) {
      if (err) res.status(500).send({status: 500, message: 'Can not connect to server', error: true, data: null });
      if (!history) return res.status(200).send({status: 200, message: 'File not found', error: true, data: null });
      for (let i = 0; i < history.content.length; i++) {
         let order = history.content[i];
         switch (order.status) {
            case "NLPError":
               ListNLPError.push(order);
               NLPError += 1;
               break;
            case "ValidateError":
               ListValidateError.push(order);
               ValidateError += 1;
               break;
            case "CreateOrderError":
               ListCreateOrderError.push(order);
               CreateOrderError += 1;
               break;
            case "CreateOrderError":
               ListCompleted.push(order);
               Completed += 1;
               break;
            case "New":
               ListNew.push(order);
               New += 1;
               break;
            default:
               ListChange.push(order);
               Change += 1;
         }
      }

      let index = page_size * (page_index - 1);
      let list_order = [];

      for (let i = index; i < index + page_size; i++) {
         if (history.content[i] != null) {
            list_order.push(history.content[i]);
         }

      }

      res.status(200).send({status: 200, message: 'success', error: false, data: {
         "NLPError": { count: NLPError, orders: ListNLPError },
         "ValidateError": { count: ValidateError, orders: ListValidateError },
         "CreateOrderError": { count: CreateOrderError, orders: ListCreateOrderError },
         "Completed": { count: Completed, orders: ListCompleted },
         "New": { count: New, orders: ListNew },
         "Change": { count: Change, orders: ListChange },
         "Total": history.content.length,
         "ListOrder": list_order
      }});
   })

});

router.post('/history', function(req, res) {
   if(req.body.cus_id == undefined){
      return res.status(400).send({status: 400, message: 'CusId is undefined', error: true, data: null });
   }

   UploadExel.find({ cusId: req.body.cus_id }, function(err, history) {
      if (err) res.status(500).send({status: 500, message: 'Can not connect to server', error: true, data: null });
      if (!history) return res.status(200).send({status: 200, message: 'File not found', error: true, data: null });
      // res.send({ data: history })
      let list_file = [];

      for (let i = 0; i < history.length; i++) {
         let NLPError = 0, ValidateError = 0, CreateOrderError = 0, Completed = 0, New = 0, Change = 0, Processing = 0;
         for (let j = 0; j < history[i].content.length; j++) {

            let order = history[i].content[j];
            switch (order.status) {
               case "New":
                  New += 1;
                  break;
               case "NLPError":
                  NLPError += 1;
                  break;
               case "ValidateError":
                  ValidateError += 1;
                  break;
               case "CreateOrderError":
                  CreateOrderError += 1;
                  break;
               case "Completed":
                  Completed += 1;
                  break;
               case "Processing":
                  Processing += 1;
                  break;
               default:
                  Change += 1;
            }
         }
         list_file.push({
            "fileName": history[i].filename,
            "uploadTime": history[i].uploadTime,
            "originalName": history[i].originalName,
            "New": New,
            "NLPError": NLPError,
            "ValidateError": ValidateError,
            "CreateOrderError": CreateOrderError,
            "Completed": Completed,
            "Processing": Processing,
            "Change": Change,
            "total": history[i].content.length,
         });

      }

      res.status(200).send({status: 200, message: 'success', error: false, data: list_file});
   })
});
module.exports = router;
