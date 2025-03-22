const jwt = require('jsonwebtoken');
require("dotenv").config();

console.log("JWT_SECRET",process.env.JWT_SECRET_KEY);

// const JWT_SECRET= 'bbd6b2c4af7f55c47edf9e1b27cf26fbdc572f00f0b78d64825f38f1718bc3bcdcb14e0171d11d1ce7f2ed9f9b18c7c3fc75fdcf7bed5eb495c4dca1ccd65370'
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }



  // Extract token from Bearer string
  const token = authHeader.split(' ')[1];
    // console.log("token from verify",token);

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    console.log("decoded",req.user);

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token',
        error: error.message
     });
  }
};

module.exports = verifyToken;