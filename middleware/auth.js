const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, access denied'});
  }

  try {
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}