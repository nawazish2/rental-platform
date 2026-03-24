const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit','rent','maintenance'], required: true },
  status: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  month: { type: String }, // e.g. "March 2026"
  notes: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);
