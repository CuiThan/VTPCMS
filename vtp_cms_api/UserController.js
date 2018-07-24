var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var verify = require('../auth/VerifyToken');
var User = require('../dao/user');
var FacebookUser = require('../dao/facebook-user');
var Employee = require('../dao/employee');
var fs = require('fs');
var axios = require('axios');
var path = require('path');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/list_all', verify.verifyAppToken, function(req, res){
   User.find({}, function (err, users) {
      if(err) res.status(500).send({ message: "Can not connect to server"});
      res.status(200).send(users);
   })
})

router.get('/list-facebook-user/:page', function (req, res) {
   var perPage = 10;
    var page = req.params.page || 1;

   FacebookUser.find({}).skip((perPage * page) - perPage).limit(perPage)
   .exec(function(err, employeeList) {
      FacebookUser.count().exec(function(err, count) {
          if (err) return next(err)
          res.render('list-facebook-user', {
              employeeList: employeeList,
              maxPage: 13,
              current: page,
              pages: Math.ceil(count / perPage),
              index: perPage * page - perPage,
              title: 'Danh sách tài khoản',
              // moment: moment
          })
      })
   })
})

function asyncInsert(i, array) {
      if (i < array.length) {
         var line = array[i].split('|');
         FacebookUser.create({
                  user_id: line[0],
                  phone: line[1]
               }, function (err, obj) {
                  console.log(i);
                  asyncInsert(i+1, array);
               });
         // axios.get('https://graph.facebook.com/' + line[0] +
         //    '?fields=birthday,age_range,about,address,education,email,first_name,gender,hometown,link,last_name,location,name,middle_name,relationship_status'
         //    + '&access_token=283111455508809|l0GhSkkg0AHZkDEPimP50eBhz14'
         // )
         // .then( data => {
         //    var user_info = data.data;
         //    if(user_info.error) {
         //       console.log(i + '- not exists');
         //    } else {
         //       FacebookUser.create({
         //          user_id: line[0],
         //          name: verify.checkUndefined(user_info.name),
         //          first_name : verify.checkUndefined(user_info.first_name),
         //          last_name : verify.checkUndefined(user_info.last_name),
         //          middle_name : verify.checkUndefined(user_info.middle_name),
         //          address: verify.checkUndefined(user_info.address),
         //          hometown: verify.checkUndefined(user_info.hometown),
         //          education: verify.checkUndefined(user_info.education),
         //          gender: verify.checkUndefined(user_info.gender),
         //          location: verify.checkUndefined(user_info.location),
         //          relationship_status: verify.checkUndefined(user_info.relationship_status),
         //          age_range: verify.checkUndefined(user_info.age_range),
         //          birthday: verify.checkUndefined(user_info.birthday),
         //          about: verify.checkUndefined(user_info.about),
         //          email: verify.checkUndefined(user_info.email),
         //          phone: line[1]
         //       }, function (err, obj) {
         //          console.log(i);
         //          asyncInsert(i+1, array);
         //       });
         //    }
         // })
         // .catch( err => {
         //    console.log(i + ' - catch error');
         //    // console.log(err);
         //    asyncInsert(i+1, array);
         // })
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
         asyncInsert(0, content);
      });
   } else {
      console.log('Finish read file ' + listFiles[i] );
   }
}

router.post('/import-fb-user', function (req, res) {
   let dirname = path.join(__root, 'public/test/');
   // let dirname = path.join(__root, 'public/test/');
   fs.readdir(dirname, function(err, filenames) {
      if (err) {
         // onError(err);
         return err;
      }
      console.log(filenames);
      // asyncReadFile(dirname, 0, filenames);
      filenames.forEach(function(filename) {
         fs.readFile(dirname + filename, 'utf-8', function(err, content) {
            if (err) {
               // onError(err);
               return;
            }
            content = content.split('\n');
            console.log(content.length);
            asyncInsert(0, content);
         });
      });
   });
});

router.post('/update-empl')

module.exports = router;
