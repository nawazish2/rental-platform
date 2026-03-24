const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['visit_update','ticket_reply','movein_update','new_listing','payment'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
