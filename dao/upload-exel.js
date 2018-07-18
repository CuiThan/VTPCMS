var mongoose = require('mongoose');

// interface headerSchema {
//    A: string;
//    B: string;
// };

var UploadExelSchema = new mongoose.Schema({
   header: [],
   content: [
      // { index: Number, data: {} }
   ],
   cusId : String,
   rowCount: Number,
   GUI_ID: String,
   uploadTime: Date,
});

mongoose.model('UploadExel', UploadExelSchema);

module.exports = mongoose.model('UploadExel');
