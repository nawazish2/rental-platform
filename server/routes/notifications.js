const router = require('express').Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

// Helper to create a notification (exported for use in other routes)
const createNotification = async (userId, type, title, message, link = '') => {
  try { await Notification.create({ user: userId, type, title, message, link }); } catch (e) {}
};

// GET my notifications
router.get('/my', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ notifications, unread });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH mark one as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH mark all as read
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
module.exports.createNotification = createNotification;
