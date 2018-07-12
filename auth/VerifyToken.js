var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file



module.exports = {
   verifyAppToken: function (req, res, next) {
      // check header or url parameters or post parameters for token
      var token = req.headers['token'];
      if (!token)
         return res.status(403).send({ auth: false, message: 'No token provided.' });
      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
         if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
         // console.log(decoded)
         // if everything is good, save to request for use in other routes
         req.clientAppId = decoded.id;
         // req.clientAppId = decoded.userId;
         next();
      });
   },

   verifyUserToken: function (req, res, next) {
      // check header or url parameters or post parameters for token
      var token = req.headers['token'];
      if (!token)
         return res.status(403).send({ auth: false, message: 'No token provided.' });
      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {
         if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
         console.log(decoded)
         // if everything is good, save to request for use in other routes
         req.clientAppId = decoded.userId;
         next();
      });
   }


}
