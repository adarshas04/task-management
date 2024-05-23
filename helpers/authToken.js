const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  console.log(req.headers);
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      /*const {exp} = jwt.decode(token);
      if(Date.now() > exp*1000) {
        req.statusCode = 401;
        req.user = null;
        req.message = "Token has already expired";
        next();
      }*/
      req.user = decoded;
      req.statusCode = 200;
      req.message = "Header verification successful";
      next();
    } catch (err) {
      req.statusCode = 500;
      req.user = null;
      req.message = "Header verification failed, some issue with the token";
      next();
    }
  } else {
    req.statusCode = 401;
    req.user = null;
    req.message = "Authorization header not found";
    next();
  }
};

module.exports = {verifyToken};