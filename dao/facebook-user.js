var mongoose = require('mongoose');
var FacebookUserSchema = new mongoose.Schema({

   // name: String,
   // first_name : String,
   // last_name : String,
   // middle_name : String,
   // address: String,
   // hometown: String,
   // education: String,
   // gender: String,
   // location: String,
   // relationship_status: String,
   // age_range: [],
   // birthday: Date,
   // about: String,
   // email: String,
   user_id: {
      type: String,
      index: true
   },
   phone: {
      type: String,
      index: true
   },
   status: { type: Number, default: 0 },
   deactivate: Boolean,
   info: []
});

mongoose.model('FacebookUser', FacebookUserSchema);

module.exports = mongoose.model('FacebookUser');
