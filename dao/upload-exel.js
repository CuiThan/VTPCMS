var mongoose = require('mongoose');

// interface headerSchema {
//    A: string;
//    B: string;
// };

var UploadExelSchema = new mongoose.Schema({
   status: String,
   fileName: String,
   originalName: String,
   header: [],
   inventory: Object,
   content: [
      // {
      //    order: {},
      //    index: Number,
      //    status: String
      // }
   ],
   cusId : String,
   rowCount: Number,
   GUI_ID: String,
   uploadTime: Date
});

mongoose.model('UploadExel', UploadExelSchema);

module.exports = mongoose.model('UploadExel');
