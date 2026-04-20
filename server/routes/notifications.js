const router = require('express').Router();
const Notification = require('../models/Notification');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const { readNotificationValidation } = require('../validators');
const { serverError } = require('../utils/serverError');

// GET my notifications
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ user: userId, read: false });
    res.json({ notifications, unread });
  } catch (e) { return serverError(res, e); }
});

// PATCH mark all as read (before /:id/read so "read-all" is never parsed as an id)
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (e) { return serverError(res, e); }
});

// PATCH mark one as read
router.patch('/:id/read', verifyToken, readNotificationValidation, validate, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { return serverError(res, e); }
});

module.exports = router;
