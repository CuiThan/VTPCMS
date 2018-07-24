var mongoose = require('mongoose');
var FacebookUserSchema = new mongoose.Schema({
   user_id: String,
   name: String,
   first_name : String,
   last_name : String,
   middle_name : String,
   address: String,
   hometown: String,
   education: String,
   gender: String,
   location: String,
   relationship_status: String,
   age_range: [],
   birthday: Date,
   about: String,
   email: String,
   phone: String,
});

mongoose.model('FacebookUser', FacebookUserSchema);

module.exports = mongoose.model('FacebookUser');
