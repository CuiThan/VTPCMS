var mongoose = require('mongoose');
var OfferPriceSchema = new mongoose.Schema({
    offerPriceId : String,
    fullName : String,
    email : String,
    phone : String,
    address : String,
    service: String,
    unit: String,
    packageMaterial: String,
    weight : Number,
    length: Number,
    width: Number,
    height: Number,
    departurePlace: String,
    destinatonPlace: String,
    timeTarget: Number,
    temperatureRequired: String,
    priceRequired: Number,
    wareContent: String,
    note: String
});
mongoose.model('OfferPrice', OfferPriceSchema);

module.exports = mongoose.model('OfferPrice');
