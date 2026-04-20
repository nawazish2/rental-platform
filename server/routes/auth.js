const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  authRegisterValidation,
  authLoginValidation,
  profileUpdateValidation,
} = require('../validators');
const { uploadImages } = require('../utils/cloudinary');
const { serverError } = require('../utils/serverError');
const authLimiter = require('../middleware/authRateLimit');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// Register
router.post('/register', authLimiter, authRegisterValidation, validate, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: role || 'tenant', phone });
    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    return serverError(res, err);
  }
});

// Login
router.post('/login', authLimiter, authLoginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    return serverError(res, err);
  }
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// PUT update profile
router.put('/profile', verifyToken, uploadImages.single('avatar'), profileUpdateValidation, validate, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.file) updates.avatar = req.file.path;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    const user = await User.findByIdAndUpdate(req.user._id || req.user.id, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (e) {
    return serverError(res, e);
  }
});

module.exports = router;
