const Notification = require('../models/Notification');
const { emitToUser } = require('./realtime');

const createNotification = async (userId, type, title, message, link = '') => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
    });

    const unread = await Notification.countDocuments({ user: userId, read: false });

    emitToUser(userId, 'notification:new', {
      notification,
      unread,
    });

    return notification;
  } catch (error) {
    console.error('[notifications] createNotification failed:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
