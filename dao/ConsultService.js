var mongoose = require('mongoose');
var ConsultServiceSchema = new mongoose.Schema({
    consultServiceId : String,
    fullName : String,
    phone: String,
    email : String,
    address : String,
    title : String,
    content: String,
    note: String
});
mongoose.model('ConsultService', ConsultServiceSchema);

module.exports = mongoose.model('ConsultService');
