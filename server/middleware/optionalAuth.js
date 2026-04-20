const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Attaches req.user when a valid Bearer token is present; otherwise req.user is null. */
const optionalAuth = async (req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    /* invalid token — treat as anonymous */
  }
  next();
};

module.exports = optionalAuth;
