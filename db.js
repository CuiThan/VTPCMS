var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://vtp_cms:VtpCmsXymn6@125.212.238.119:27017/vtp_cms', { useMongoClient: true });
// mongoose.connect('mongodb://localhost:27017/cms', { useMongoClient: true });
mongoose.connect('mongodb://localhost:27017/local_vtdev', { useMongoClient: true });
