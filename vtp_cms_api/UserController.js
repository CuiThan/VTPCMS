var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var fs = require('fs');
var xlsx = require('node-xlsx');
var axios = require('axios');
var schedule = require('node-schedule')
var path = require('path');

var verify = require('../auth/VerifyToken');
var User = require('../dao/user');
var FacebookUser = require('../dao/facebook-user');
var Employee = require('../dao/employee');
var Organization = require('../dao/organization');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/list_all', verify.verifyAppToken, function(req, res){
   User.find({}, function (err, users) {
      if(err) res.status(500).send({ message: "Can not connect to server"});
      res.status(200).send(users);
   })
});

// ****************************** FACEBOOK USER ******************************

router.get('/list-facebook-user/:page', function (req, res) {
   var perPage = 10;
    var page = req.params.page || 1;

   FacebookUser.find({}).skip((perPage * page) - perPage).limit(perPage)
   .exec(function(err, userList) {
      FacebookUser.count().exec(function(err, count) {
          if (err) return next(err)
          res.render('list-facebook-user', {
              userList: userList,
              maxPage: 13,
              current: page,
              pages: Math.ceil(count / perPage),
              index: perPage * page - perPage,
              title: 'Danh sách tài khoản',
              // moment: moment
          })
      })
   })
});



function asyncUpdate(i, array) {
   if (i < array.length) {
      var row = array[i];
      axios.get('https://graph.facebook.com/' + row.user_id +
         '?fields=birthday,age_range,about,address,education,email,first_name,gender,hometown,link,last_name,location,name,middle_name,relationship_status'
         + '&access_token=283111455508809|l0GhSkkg0AHZkDEPimP50eBhz14'
      )
      .then( data => {
         var user_info = data.data;
         if(user_info.error) {
            console.log(i + '- can not update');
         } else {
            FacebookUser.findByIdAndUpdate( row._id, {
               status: 1,
               info: user_info
            }, function (err, obj) {
               console.log('update ' + i);
               asyncUpdate(i+1, array);
            });
         }
      })
      .catch( err => {
         console.log(i + ' - catch error');
         // console.log(err);
         asyncUpdate(i+1, array);
      })

   } else {
      console.log('finish update');
   }
};

function asyncInsert(i, array) {
   if (i < array.length) {
      var line = array[i].split('|');
      console.log(line[1]);
      FacebookUser.create({
         user_id: line[0],
         phone: line[1],
         info: []
      }, function (err, obj) {
         console.log('insert ' + i);
         asyncInsert(i+1, array);
      });
   } else {
      console.log('Finish last line');
   }
}

function asyncReadFile(dirname, i, listFiles) {
   if (i < listFiles.length) {
      fs.readFile(dirname + listFiles[i], 'utf-8', function(err, content) {
         if (err) {
            // onError(err);
            return;
         }
         var content = content.split('\n');
         console.log(content.length);
         // for (let j = 0; j < content.length; j++) {
         //    let row = content[j].split('|');
         //    // console.log(row);
         //    listUser.push({
         //       user_id: row[0],
         //       phone: row[1],
         //       info: []
         //    });
         // }
         // FacebookUser.insertMany( , { multiple: true })
         // asyncInsert(0, content);
      });
   } else {
      console.log('Finish read file ' + listFiles[i] );
   }
}

function updateFbCrontab() {
   FacebookUser.find({ status: 0 }).limit(590).exec()
   .then( data => {
      asyncUpdate(0, data);
   })
   .catch( err => {
      console.log(err);
      return;
   })
}

router.get('/update-fb-user', function (req, res) {
   var j = schedule.scheduleJob('*/10 * * * *', function(){
      updateFbCrontab();
   });
})

router.post('/import-fb-user', function (req, res) {
   let dirname = path.join(__root, 'public/test/');
   // let dirname = path.join(__root, 'public/test/');
   let listUser = [];
   fs.readdir(dirname, function(err, filenames) {
      if (err) {
         // onError(err);
         return err;
      }

      // if list all file in dirname success
      for (var i = 0; i < filenames.length; i++) {
         console.log('------------------------------------------------------------------------------' + i);
         let content = fs.readFileSync(dirname + filenames[i], 'utf-8');
         //if read file success and split content to lines
         content = content.split('\n');
         for (let j = 0; j < content.length; j++) {
            let row = content[j].split('|');
            // console.log(row);
            listUser.push({
               user_id: row[0],
               phone: row[1],
               info: []
            });
         }

      }
      console.log('length ' +  listUser.length);
      FacebookUser.insertMany( listUser, { multiple: true }, function(err, cb){
         if(err) {
            console.log(err);
         } else {
            console.log(cb);
         }
      })
      // res.send({ user: listUser, length: listUser.length });
      // filenames.forEach(function(filename) {
      //    console.log(filename);
      //    fs.readFile(dirname + filename, 'utf-8', function(err, content) {
      //       if (err) {
      //          // onError(err);
      //          return;
      //       }
      //       //if read file success and split content to lines
      //       content = content.split('\n');
      //       // for (var i = 0; i < content.length; i++) {
      //       //    content[i] = content[i].split('|');
      //       //    console.log(content[i]);
      //       //    listUser.push({
      //       //       user_id: content[i][0],
      //       //       phone: content[i][1],
      //       //       info: []
      //       //    });
      //       // }
      //       //       res.send({ user: listUser, length: listUser.length });
      //
      //       //start insert to db
      //       // asyncInsert(0, content);
      //    });
      // });


   });
});

// ****************************** END OF FACEBOOK USER ******************************



module.exports = router;
