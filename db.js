var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://vtp_cms:VtpCmsXymn6@125.212.238.119:27017/vtp_cms', { useMongoClient: true });
mongoose.connect('mongodb://localhost:27017/cms', { useMongoClient: true });
// mongoose.connect('mongodb://125.212.238.130:27017/cms', { useMongoClient: true });
// mongoose.connect('mongodb://localhost:27017/local_vtdev', { useMongoClient: true });

// db.createUser(
//   {
//     user: "vtp_cms",
//     pwd: "VtpCmsXymn6",
//     roles: [ { role: "readWrite", db: "vtp_cms" } ]
//   }
// )
