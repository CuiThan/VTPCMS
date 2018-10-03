var mongoose = require('mongoose');
var connection = mongoose.createConnection('mongodb://vtpcrawler:123456a%40@125.212.238.119:27017/vtpcrawler');

var FacebookUserCrawler = new mongoose.Schema({
    _id: String,
    name: String,
    verification_status : String,
    location: Object,
    link: String,
    is_unclaimed: Boolean
}, {
    collection: 'facebookPage'
});

connection.model('FacebookUserCrawler', FacebookUserCrawler);

module.exports = connection.model('FacebookUserCrawler');
